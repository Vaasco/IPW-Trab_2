const errors = require('../borga-erros.js');

const services_builder = require('../borga-services.js');

const test_data_int = require('../borga-data-mem.js');

const test_user  = 'costakilapada';
const test_token = 'abd331d7-fd48-4054-9b73-7b7edf2941a6';

describe('Tests with data_mem', () => {
		
    afterEach(async () => {
        await test_data_int.reset();
    });
    
    test("Create new group", async () => {
        
    });
    
    test("Edit group", async () => {
        
    });
    test("List all groups", async () => {
        
    });
    test("Delete group", async () => {
        
    });
    test("Get Details of a group", async () => {
        
    });
    test("Add a game to a group", async () => {
        
    });
    test("Remove a game from a group", async () => {
        
    });
    
}
);


describe('Tests with DB', () => {
		
    afterEach(async () => {
        await test_data_int.reset();
    });
    
    test('save existing book', async () => {
        const bookId = 'E00FkgEACAAJ';
        const addRes = await
            default_services.addBook(test_token, bookId);
        expect(addRes).toBeDefined();
        expect(addRes.bookId).toEqual(bookId);
        const checkRes = await
            test_data_int.loadBook(test_user, bookId);
        expect(checkRes.id).toEqual(bookId);
    });
    
    test('obtain empty list', async () => {
        const listRes = await 
            default_services.getAllBooks(test_token);
        expect(listRes).toBeDefined();
        expect(listRes.books).toEqual([]);
    });
}
);