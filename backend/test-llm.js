require('dotenv').config();
const { chat } = require('./services/openrouterClient');

chat(
  [{ role: 'user', content: 'Reply with valid JSON only: {"test": true}' }],
  0.1,
  true
)
  .then(r => {
    console.log('LLM OK:', r.slice(0, 200));
    process.exit(0);
  })
  .catch(e => {
    console.error('LLM Error:', e.message);
    process.exit(1);
  });
