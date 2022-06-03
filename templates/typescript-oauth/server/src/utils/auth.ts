import { CLIENT_SECRET, GRAPHQL_URL } from '@/config';
import jwt from 'jsonwebtoken';
const DEFAULT_ISS = 'AN_AWESOME_APP'

export const sign = (options: { networkId: string, memberId: string, iss?: string }) => {
  return jwt.sign(
    {
      sub: options.networkId,
      aud: GRAPHQL_URL,
      usr: options.memberId,
      iss: options.iss || DEFAULT_ISS,
    },
    CLIENT_SECRET,
    {
      expiresIn: '2d',
    },
  );
};
export const verify = (token: string) => {
  return jwt.verify(token, CLIENT_SECRET, {
    ignoreExpiration: false,
  });
};

export default{
    sign,
    verify
}