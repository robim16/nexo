import { ICommentRepository } from '../../ports/repositories/ICommentRepository'
import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { INotificationRepository } from '../../ports/repositories/INotificationRepository'
import { IFollowRepository } from '../../ports/repositories/IFollowRepository'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents } from '../../ports/events/DomainEvents'
import { Comment } from '../../entities/Comment'
import { PostId } from '../../value-objects/PostId'
import { UserId } from '../../value-objects/UserId'
import { PostContent } from '../../value-objects/PostContent'
import { PostDomainError } from '../../errors/PostDomainError'
import { Notification } from '../../entities/Notification'

export interface AddCommentDTO {
  postId: string
  userId: string
  content: string
}

export interface AddCommentResult {
  comment: Comment
}

export class AddCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly postRepository: IPostRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly followRepository: IFollowRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: AddCommentDTO): Promise<AddCommentResult> {
    const postId = PostId.fromString(dto.postId)
    const userId = UserId.fromString(dto.userId)
    const content = PostContent.create(dto.content)

    // 1. Verificar que el post existe
    const post = await this.postRepository.findById(postId)
    if (!post) {
      throw PostDomainError.notFound(dto.postId)
    }

    // 2. Crear entidad Comment
    const comment = Comment.create({
      postId,
      authorId: userId,
      content
    })

    // 3. Persistir comentario
    await this.commentRepository.save(comment)

    // 4. Incrementar contador en el post
    await this.postRepository.incrementCommentsCount(postId)

    // 5. Notificar al autor del post si no es el mismo usuario
    if (!post.isAuthor(userId)) {
      const notification = Notification.create({
        recipientId: post.authorId,
        actorId: userId,
        type: 'COMMENT',
        postId
      })
      await this.notificationRepository.save(notification)
    }

    // 6. Notificar a los seguidores del actor (quien comentó)
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

    // 6. Publicar evento
    this.eventBus.publish({
      type: DomainEvents.POST_COMMENTED,
      timestamp: new Date(),
      payload: {
        postId: dto.postId,
        commentId: comment.id.value,
        authorId: dto.userId
      }
    })

    return { comment }
  }
}
