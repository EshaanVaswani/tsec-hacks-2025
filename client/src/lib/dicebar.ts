import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

export function generateAvatarUrl(username: string): string {
  const avatar = createAvatar(lorelei, {
    seed: username,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
  });

  return avatar.toDataUri();
}