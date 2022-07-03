module.exports = {
  generateCodeFromName: (name) => {
    const generated_code = name.replace(/ /g, '_')
    return generated_code.replace(/[^\w]/g, '').toLowerCase()
  }
}
