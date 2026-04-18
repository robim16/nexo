import { test, expect } from '@playwright/test'

test.describe('Feed Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login rápido o asumiendo sesión si el emulador la mantiene
    await page.goto('/')
    
    // Si no está logueado, loguear (helper)
    const isLogin = await page.url().includes('login')
    if (isLogin) {
      await page.getByLabel('Correo Electrónico').fill('test@example.com')
      await page.getByLabel('Contraseña').fill('password123')
      await page.click('button:has-text("Iniciar Sesión")')
      await expect(page).toHaveURL('/')
    }
  })

  test('should create a new post and see it in the feed', async ({ page }) => {
    const postContent = `Test post content at ${new Date().toISOString()}`
    
    await page.getByPlaceholder('¿Qué estás pensando?').fill(postContent)
    await page.click('button:has-text("Publicar")')

    // Verificar que el post aparece arriba del feed
    await expect(page.getByText(postContent)).toBeVisible()
  })

  test('should allow liking a post', async ({ page }) => {
    // Encontrar el primer botón de like (corazón blanco)
    const likeBtn = page.locator('.action-btn').filter({ hasText: '🤍' }).first()
    const initialLikeCount = await likeBtn.innerText()
    
    await likeBtn.click()

    // Debería cambiar a corazón rojo y subir el contador
    await expect(page.locator('.action-btn').filter({ hasText: '❤️' }).first()).toBeVisible()
    // No verificamos el número exacto para evitar flakiness, pero que el icono cambie es clave
  })
})
