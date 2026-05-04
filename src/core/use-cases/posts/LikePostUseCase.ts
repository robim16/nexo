/**
 * LikePostUseCase — Caso de uso: dar/quitar like a un post.
 * Soporta toggle (si ya tiene like, lo quita; si no, lo da).
 * Genera notificación al autor si es un like nuevo.
 */
import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { INotificationRepository } from '../../ports/repositories/INotificationRepository'
import { IFollowRepository } from '../../ports/repositories/IFollowRepository'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents, PostLikedPayload } from '../../ports/events/DomainEvents'
import { Notification } from '../../entities/Notification'
import { PostId } from '../../value-objects/PostId'
import { UserId } from '../../value-objects/UserId'
import { PostDomainError } from '../../errors/PostDomainError'

export interface LikePostDTO {
  postId: string
  userId: string
}

export interface LikePostResult {
  liked: boolean // true = dio like, false = quitó like
  likesCount: number
}

export class LikePostUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly followRepository: IFollowRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: LikePostDTO): Promise<LikePostResult> {
    const postId = PostId.fromString(dto.postId)
    const userId = UserId.fromString(dto.userId)

    // 1. Cargar el post
    const post = await this.postRepository.findById(postId)
    if (!post) {
      throw PostDomainError.notFound(dto.postId)
    }

    const wasLiked = post.isLikedBy(userId)

    if (wasLiked) {
      // 2a. Quitar like
      post.unlike(userId)
      await this.postRepository.unlike(postId, userId)

      this.eventBus.publish({
        type: DomainEvents.POST_UNLIKED,
        timestamp: new Date(),
        payload: {
          postId: dto.postId,
          authorId: post.authorId.value,
          userId: dto.userId
        }
      })

      return { liked: false, likesCount: post.likesCount }
    } else {
      // 2b. Dar like
      post.like(userId)
      await this.postRepository.like(postId, userId)

      // 3. Notificar al autor si no es el mismo usuario
      if (!post.isAuthor(userId)) {
        const notification = Notification.create({
          recipientId: post.authorId,
          actorId: userId,
          type: 'LIKE',
          postId
        })
        await this.notificationRepository.save(notification)
      }

      // 4. Notificar a los seguidores del actor (quien dio like)
      const followers = await this.followRepository.findFollowers(userId)
      const followerNotifications = followers
        .filter((f) => !f.followerId.equals(post.authorId)) // No duplicar si el autor ya recibió notificación
        .map((f) =>
          Notification.create({
            recipientId: f.followerId,
            actorId: userId,
            type: 'REACTION_FOLLOWED',
            postId
          })
        )

      if (followerNotifications.length > 0) {
        await this.notificationRepository.saveMany(followerNotifications)
      }

      const payload: PostLikedPayload = {
        postId: dto.postId,
        authorId: post.authorId.value,
        userId: dto.userId
      }

      this.eventBus.publish({
        type: DomainEvents.POST_LIKED,
        timestamp: new Date(),
        payload
      })

      return { liked: true, likesCount: post.likesCount }
    }
  }
}
