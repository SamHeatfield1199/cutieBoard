// Returns the CSS class name key itself so className={styles.foo} → 'foo'
module.exports = new Proxy({}, { get: (_, key) => String(key) });
