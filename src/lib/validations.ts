import { z } from 'zod';

// Zod validation schemas will be defined here.

export const loginSchema = z.object({
  email: z.string().email({ message: '유효한 이메일을 입력해주세요.' }),
  password: z.string().min(1, { message: '비밀번호를 입력해주세요.' }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, { message: '이름은 2자 이상이어야 합니다.' }),
  email: z.string().email({ message: '유효한 이메일을 입력해주세요.' }),
  password: z.string().min(8, { message: '비밀번호는 8자 이상이어야 합니다.' }),
  confirmPassword: z.string(),
  churchName: z.string().min(1, { message: '교회 이름을 입력해주세요.' }),
  role: z.enum(['LEADER', 'MEMBER'], { message: '역할을 선택해주세요.' }),
  terms: z.boolean().refine((val) => val === true, {
    message: '이용약관에 동의해야 합니다.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
});

export type RegisterSchema = z.infer<typeof registerSchema>;

