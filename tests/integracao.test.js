process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

describe('API de Alunos', () => {

  beforeEach((done) => {
    db.serialize(() => {
        db.run('DELETE FROM alunos', done);
    });
  });

  afterAll((done) => {
    db.close(done);
  });

  test('deve criar um aluno e persistir no banco', async () => {
    const resposta = await request(app)
      .post('/alunos')
      .send({
        nome: 'Carlos',
        matricula: '2026001'
      });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toHaveProperty('id');
    expect(resposta.body.nome).toBe('Carlos');
    expect(resposta.body.matricula).toBe('2026001');

    await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM alunos WHERE matricula = ?',
        ['2026001'],
        (err, row) => {
          if (err) return reject(err);

          expect(row).not.toBeUndefined();
          expect(row.nome).toBe('Carlos');
          expect(row.matricula).toBe('2026001');

          resolve();
        }
      );
    });
  });

  test('deve retornar 400 quando faltar matrícula', async () => {
    const resposta = await request(app)
      .post('/alunos')
      .send({
        nome: 'Ana'
      });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Dados incompletos');
  });

  test('deve retornar 409 para matrícula duplicada', async () => {
    await request(app)
      .post('/alunos')
      .send({
        nome: 'Maria',
        matricula: '2026123'
      });

    const resposta = await request(app)
      .post('/alunos')
      .send({
        nome: 'João',
        matricula: '2026123'
      });

    expect(resposta.status).toBe(409);
    expect(resposta.body.erro).toBe('Matrícula já existe');
  });

});

