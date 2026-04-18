/**
 * Dependency Injection Container
 * Implementación simple para desacoplar el core/infraestructura de la aplicación.
 */

class Container {
  private services = new Map<string | symbol, any>();

  /**
   * Registra un servicio o valor en el contenedor.
   */
  register<T>(key: string | symbol, instance: T): void {
    this.services.set(key, instance);
  }

  /**
   * Obtiene un servicio del contenedor.
   * Lanza un error si no se encuentra.
   */
  get<T>(key: string | symbol): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service not found: ${String(key)}`);
    }
    return service;
  }

  /**
   * Verifica si un servicio existe.
   */
  has(key: string | symbol): boolean {
    return this.services.has(key);
  }
}

// Inicializar contenedor
export const container = new Container();

import { InMemoryEventBus } from './infrastructure/events/InMemoryEventBus';

// ——— Importar Infraestructura ———
import { FirebaseUserRepository } from './infrastructure/firebase/repositories/FirebaseUserRepository';
import { FirebasePostRepository } from './infrastructure/firebase/repositories/FirebasePostRepository';
import { FirebaseFollowRepository } from './infrastructure/firebase/repositories/FirebaseFollowRepository';
import { FirebaseNotificationRepository } from './infrastructure/firebase/repositories/FirebaseNotificationRepository';
import { FirebaseAuthService } from './infrastructure/firebase/services/FirebaseAuthService';
import { FirebaseStorageService } from './infrastructure/firebase/services/FirebaseStorageService';

// ——— Importar Casos de Uso ———
import { LoginUseCase } from './core/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from './core/use-cases/auth/LogoutUseCase';
import { RegisterUseCase } from './core/use-cases/auth/RegisterUseCase';
import { CreatePostUseCase } from './core/use-cases/posts/CreatePostUseCase';
import { GetFeedUseCase } from './core/use-cases/posts/GetFeedUseCase';
import { LikePostUseCase } from './core/use-cases/posts/LikePostUseCase';
import { DeletePostUseCase } from './core/use-cases/posts/DeletePostUseCase';
import { EditPostUseCase } from './core/use-cases/posts/EditPostUseCase';
import { FollowUserUseCase } from './core/use-cases/social/FollowUserUseCase';
import { UnfollowUserUseCase } from './core/use-cases/social/UnfollowUserUseCase';
import { GetFollowersUseCase } from './core/use-cases/social/GetFollowersUseCase';
import { GetNotificationsUseCase } from './core/use-cases/notifications/GetNotificationsUseCase';
import { MarkNotificationReadUseCase } from './core/use-cases/notifications/MarkNotificationReadUseCase';

// ——— Inicializar Instancias de Infraestructura ———
const eventBus = new InMemoryEventBus();
const authService = new FirebaseAuthService();
const storageService = new FirebaseStorageService();

const userRepository = new FirebaseUserRepository();
const postRepository = new FirebasePostRepository();
const followRepository = new FirebaseFollowRepository();
const notificationRepository = new FirebaseNotificationRepository();

// ——— Registro de Dependencias ———

// Puertos y Servicios
container.register('IEventBus', eventBus);
container.register('IAuthService', authService);
container.register('IStorageService', storageService);
container.register('IUserRepository', userRepository);
container.register('IPostRepository', postRepository);
container.register('IFollowRepository', followRepository);
container.register('INotificationRepository', notificationRepository);

// Casos de Uso (Inyección manual en constructor)
container.register('LoginUseCase', new LoginUseCase(authService, userRepository, eventBus));
container.register('LogoutUseCase', new LogoutUseCase(authService, eventBus));
container.register('RegisterUseCase', new RegisterUseCase(authService, userRepository, eventBus));

container.register('CreatePostUseCase', new CreatePostUseCase(postRepository, storageService, eventBus));
container.register('GetFeedUseCase', new GetFeedUseCase(postRepository));
container.register('LikePostUseCase', new LikePostUseCase(postRepository, eventBus));
container.register('DeletePostUseCase', new DeletePostUseCase(postRepository, eventBus));
container.register('EditPostUseCase', new EditPostUseCase(postRepository, eventBus));

container.register('FollowUserUseCase', new FollowUserUseCase(followRepository, userRepository, eventBus));
container.register('UnfollowUserUseCase', new UnfollowUserUseCase(followRepository, userRepository, eventBus));
container.register('GetFollowersUseCase', new GetFollowersUseCase(followRepository));

container.register('GetNotificationsUseCase', new GetNotificationsUseCase(notificationRepository));
container.register('MarkNotificationReadUseCase', new MarkNotificationReadUseCase(notificationRepository));

export default container;
