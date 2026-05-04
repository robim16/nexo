import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { Post } from '../../entities/Post'
import { PostId } from '../../value-objects/PostId'
import { UserId } from '../../value-objects/UserId'

export interface GetPostByIdInput {
  postId: string
}

export interface GetPostByIdOutput {
  post: Post | null
}

export class GetPostByIdUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: GetPostByIdInput): Promise<GetPostByIdOutput> {
    const postId = PostId.reconstitute(input.postId)
    const post = await this.postRepository.findById(postId)

    if (post) {
      const author = await this.userRepository.findById(UserId.reconstitute(post.authorId.value))
      if (author) {
        post.setAuthorInfo(author.displayName.value, author.avatar)
      }
    }

    return { post }
  }
}
