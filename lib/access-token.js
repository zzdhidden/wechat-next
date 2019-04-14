/**
 * accessToken
 *
 * Examples:
 *
 * ```
 * new AccessToken({access_token, expires_in, created_at})
 *  ```
 */

class AccessToken {
  constructor(data = {}) {
    this.$data = Object.assign({}, data)
  }

  get data() {
    return this.$data
  }

  get accessToken() {
    return this.$data.access_token
  }

  get expiresIn() {
    return this.$data.expires_in
  }

  get createdAt() {
    return this.$data.created_at
  }

  /**
   * Check access token is expired.
   *
   * @return {Boolean}
   *
   */

  isExpired() {
    return !this.accessToken || this.createdAt + this.expiresIn * 1000 < Date.now()
  }
}

module.exports = AccessToken