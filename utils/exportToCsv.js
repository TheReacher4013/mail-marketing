const exportToCsv = (data, fields) => {
    if (!data.length) return '';
    const header = fields.join(',');
    const rows = data.map(row =>
        fields.map(f => `"${(row[f] ?? '').toString().replace(/"/g, '""')}"`).join(',')
    );
    return [header, ...rows].join('\n');
};

module.exports = { exportToCsv };
