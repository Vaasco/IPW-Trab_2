'use strict';

const fetch   = require('node-fetch');
const request = require('supertest');

const config = require('../../../borga-config');
const server = require('../../../borga-server');

const es_spec = {
	url: config.devl_es_url,
	prefix: 'test'
};

const app = server(es_spec, config.guest);

const putConfigs = (obj) => {
    return {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj, null, 4)
    } 
}

const userUrl = (userName) => `${es_spec.url}${es_spec.prefix}_${userName}`;

test('Confirm database is running', async () => {
	const response = await fetch(`${es_spec.url}_cat/health`);
	expect(response.status).toBe(200);
});

test('Confirm guest user is created', async () => {
	const response = await fetch(`${es_spec.url}${es_spec.prefix}_tokens/_doc/${config.guest.token}`)
	expect(response.status).toBe(200)
})

describe('Integration tests', () => {

	test('Get empty group list', async() =>{
		const response = await request(app)
				.get('/api/my/groups')
				.set('Authorization', `Bearer ${config.guest.token}`)
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(200)

	});

})