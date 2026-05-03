import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { PostId } from '../../value-objects/PostId'

export interface SharePostInput {
  postId: string
}

export class SharePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(input: SharePostInput): Promise<void> {
    const postId = PostId.reconstitute(input.postId)
    await this.postRepository.incrementShareCount(postId)
  }
}
