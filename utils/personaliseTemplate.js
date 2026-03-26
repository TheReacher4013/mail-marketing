const personaliseTemplate = (html, contact) => {
  return html
    .replace(/{{name}}/gi,  contact.name  || 'Subscriber')
    .replace(/{{email}}/gi, contact.email || '')
    .replace(/{{phone}}/gi, contact.phone || '');
};

module.exports = { personaliseTemplate };