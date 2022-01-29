function setupGroupDelete(){
    const deleteButtons = document.querySelectorAll('.delete-groups')
    deleteButtons.forEach(butDel => {butDel.onclick = deleteGroup})
    return

    async function deleteGroup(){
        const id = this.id.replace("btn-group-", "")
        try{
            await apiDeleteGroup(id)
            deleteListItem(id)
        }catch(err){
            alert(err)
            // Alterei agora
        }
    }

    async function apiDeleteGroup(groupID){
        try {
            const deleteReq = await fetch(
                '/api/my/groups/' + groupID,
                {
                    method: 'DELETE',
                    headers: {
                        Authentication: "bearer fz3zMebxQXybYskc567j5w"
                    }
                }
            )
            if(deleteReq.status === 200){
                return
            }
        } catch (error) {
            throw new Error(
                'Failed to delete the group with id ' + groupID + '\n' +
                deleteReq.status + ' ' + deleteReq.statusText 
            )
        }
    }

    function deleteListItem(groupID) {
		const listEntryId = '#item-' + groupID;
		const listEntry = document.querySelector(listEntryId);
		listEntry.parentNode.removeChild(listEntry);
	}

}

function setupGameDelete(groupID){
    const deleteButtons = document.querySelectorAll('.delete-games')
    deleteButtons.forEach(butDel => {butDel.onclick = deleteGame})
    return

    async function deleteGame(){
        
        const id = this.id.replace("btn-game-", "")
        try{
            await apiDeleteGame(id)
            deleteListItem(id)
        }catch(err){
            alert(err)
        }
    }

    async function apiDeleteGame(gameID){
        try {
            const deleteReq = await fetch(
                '/api/my/groups/' + groupID + '/' + gameID,
                {method: 'DELETE'}
            )
            if(deleteReq.status === 200){
                return
            }
        } catch (error) {
            throw new Error(
                'Failed to delete the game with id ' + gameID + '\n' +
                deleteReq.status + ' ' + deleteReq.statusText 
            )
        }
    }

    function deleteListItem(gameID) {
		const listEntryId = '#game-' + gameID;
		const listEntry = document.querySelector(listEntryId);
		listEntry.parentNode.removeChild(listEntry);
	}

}

function setupGroupEdit(groupID){

    const editButton = document.querySelector(`#edit-${groupID}`)
    editButton.onclick = (e) => {
        const nameInput = document.querySelector("#group-name")
        const descriptionInput = document.querySelector("#group-description")
        editGroup(nameInput.value, descriptionInput.value)
    }
    
    async function editGroup(newName, newDescription){
        try{
            await apiEditGroup(groupID)
            editListItem(groupID)
        }catch(err){
            alert(err)
        }

        async function apiEditGroup(groupID){
            try {
                const editReq = await fetch(
                    '/api/my/groups/' + groupID,
                    {method: 'PUT', body: {newGroupName: newName, newGroupDescription: newDescription}}
                )
                if(editReq.status === 200){
                    return
                }
            } catch (error) {
                throw new Error(
                    'Failed to edit group with id ' + groupID + '\n' +
                    editReq.status + ' ' + editReq.statusText 
                )
            }
        }

        function editListItem(groupID) {
            //const listEntryId = '#group-' + groupID;
            //const listEntry = document.querySelector(listEntryId);
            //listEntry.parentNode.removeChild(listEntry);
        }
    }

    
}