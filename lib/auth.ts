import jwt from 'jsonwebtoken'
const SECRET = process.env.JWT_SECRET || 'change-this-secret'
export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { id: string; role: string }
}
export function generateToken(user: any) {
  return jwt.sign(user, SECRET, { expiresIn: '7d' })
}
