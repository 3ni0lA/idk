module.exports = {
  generateCodeFromName: (name) => {
    const generated_code = name.replace(/ /g, '_')
    return generated_code.replace(/[^\w]/g, '').toLowerCase()
  },
  generateAPIKey: () => {
    let pass = ''
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$0123456789'

    for (let i = 1; i <= 25; i++) {
      const char = Math.floor(Math.random() * str.length + 1)
      pass += str.charAt(char)
    }

    return pass
  }
}
