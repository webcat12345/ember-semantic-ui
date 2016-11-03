
import Authenticator from 'simple-auth-oauth2/authenticators/oauth2';

export default Authenticator.extend({
    makeRequest: function(url, data) {
        data.client_id = '5UeBZCatstf5m0uNL6bqjkgJ78nKwNy4usjYGlCt';
        data.client_secret = 'AcMk4b5jQjy64x5YYZ3D2aDmGEdWg0KrxNUHIbNWxQlC6Ze9s5dWjjX9TmDSlfKkuonKhFsBgGJmTZxeqNY2838rFypheL3KpzK0QzAfoU8Jje6zeJI4iExwH0KdNzrr';

        return this._super(url, data);
    }
});
