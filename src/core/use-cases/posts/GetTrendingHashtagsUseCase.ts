import { IPostRepository } from '../../ports/repositories/IPostRepository'

export interface GetTrendingHashtagsRequest {
  limit?: number
}

export interface TrendingHashtagResponse {
  tag: string
  count: number
}

export class GetTrendingHashtagsUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(request: GetTrendingHashtagsRequest = {}): Promise<TrendingHashtagResponse[]> {
    return this.postRepository.getTrendingHashtags(request.limit)
  }
}
