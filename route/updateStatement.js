function updateStatement(table, idColumn, fields, body, id) {
    const fieldsToUpdate = fields.filter(field => Object.prototype.hasOwnProperty.call(body, field));
    if (fieldsToUpdate.length === 0) return null;

    const assignments = fieldsToUpdate.map(field => `\`${field}\` = ?`).join(', ');
    return {
        sql: `UPDATE \`${table}\` SET ${assignments} WHERE \`${idColumn}\` = ?`,
        values: [...fieldsToUpdate.map(field => body[field]), id]
    };
}

module.exports = updateStatement;
