const auth = require("./auth");

describe('Tools', () => {
  describe('toAuthJSON', () => {
    it('should correctly format the JSON', () => {
      const user = {
        _id: '1234',
        email: 'andy@yaboi.com'
      };

      const jwtToken = auth.generateJWT(user);

      const expectedJson = {
        _id: user._id,
        email: user.email,
        token: jwtToken
      };

      const authJson = auth.toAuthJSON(user);

      expect(authJson).toEqual(expectedJson);
    });
  });
});
