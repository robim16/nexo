import { User } from '../../entities/User';
import { UserId } from '../../value-objects/UserId';
import type { IUserRepository } from '../../ports/repositories/IUserRepository';
import type { IFollowRepository } from '../../ports/repositories/IFollowRepository';

interface GetSuggestedUsersRequest {
  currentUserId: string;
  limit?: number;
}

export class GetSuggestedUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly followRepository: IFollowRepository
  ) {}

  async execute(request: GetSuggestedUsersRequest): Promise<User[]> {
    const { currentUserId, limit = 5 } = request;

    // 1. Get pool of users (e.g. 50 users to have enough to filter)
    const allUsers = await this.userRepository.findAll(50);

    // 2. Get ids the current user is already following
    const followingIds = await this.followRepository.getFollowingIds(UserId.reconstitute(currentUserId));
    const followingSet = new Set(followingIds);

    // 3. Filter out current user and already followed users
    const suggestedUsers = allUsers.filter(user => {
      const isCurrentUser = user.id.value === currentUserId;
      const isAlreadyFollowing = followingSet.has(user.id.value);
      return !isCurrentUser && !isAlreadyFollowing;
    });

    // 4. Return the requested amount
    return suggestedUsers.slice(0, limit);
  }
}
