import { TEMPLATES, EMPTY_TEMPLATE } from '../../templates/templates';

describe('TEMPLATES.sprint', () => {
  const { sprint } = TEMPLATES;

  it('has the correct metadata', () => {
    expect(sprint.id).toBe('sprint');
    expect(sprint.title).toBe('Sprint Board');
    expect(sprint.columnNames).toHaveLength(5);
    expect(sprint.columnNames).toEqual(['Backlog', 'To Do', 'In Progress', 'Review', 'Done']);
  });

  it('buildColumns() returns 5 columns', () => {
    const cols = sprint.buildColumns();
    expect(cols).toHaveLength(5);
  });

  it('buildColumns() column titles match columnNames', () => {
    const cols = sprint.buildColumns();
    const titles = cols.map(c => c.title);
    expect(titles).toEqual(sprint.columnNames);
  });

  it('buildColumns() every column has a non-empty id', () => {
    const cols = sprint.buildColumns();
    cols.forEach(col => {
      expect(col.id).toBeTruthy();
    });
  });

  it('buildColumns() all cards have unique ids', () => {
    const cols = sprint.buildColumns();
    const ids = cols.flatMap(c => c.cards.map(card => card.id));
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('buildColumns() generates new ids each time it is called', () => {
    const cols1 = sprint.buildColumns();
    const cols2 = sprint.buildColumns();
    const ids1 = cols1.map(c => c.id);
    const ids2 = cols2.map(c => c.id);
    expect(ids1).not.toEqual(ids2);
  });
});

describe('TEMPLATES.personal', () => {
  const { personal } = TEMPLATES;

  it('has the correct metadata', () => {
    expect(personal.id).toBe('personal');
    expect(personal.title).toBe('Personal Tasks');
    expect(personal.columnNames).toHaveLength(4);
    expect(personal.columnNames).toEqual(['Ideas', 'This Week', 'Doing', 'Completed']);
  });

  it('buildColumns() returns 4 columns', () => {
    const cols = personal.buildColumns();
    expect(cols).toHaveLength(4);
  });

  it('buildColumns() every card has a non-empty title', () => {
    const cols = personal.buildColumns();
    cols.flatMap(c => c.cards).forEach(card => {
      expect(card.title.length).toBeGreaterThan(0);
    });
  });
});

describe('EMPTY_TEMPLATE', () => {
  it('has id "empty"', () => {
    expect(EMPTY_TEMPLATE.id).toBe('empty');
  });

  it('has no column names', () => {
    expect(EMPTY_TEMPLATE.columnNames).toHaveLength(0);
  });
});
