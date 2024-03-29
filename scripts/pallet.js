var palletId = location.search.substring(1)

$(document).ready(function() {
    populatePage()
    populateFormDropdowns()
    $('#itemEditAlert').hide()
    $('#itemEditSuccess').hide()

    $('#back-to-orders').click(function() {
        window.location.href = `index.html`
    })

    $('#submitItemChanges').click(function() {
        let errors = validateForm()
        if (errors == '') {
            editItem($('#idNumber').html())
            $('#itemEditSuccess').show()

        } else {
            $('#itemEditAlert').html(errors)
            $('#itemEditAlert').show()
        }
    })

    $('#cancelEdit').click(function() {
        $('#itemEditAlert').hide()  
        $('#itemEditSuccess').hide()       
    })
})

const editItem = async (itemId) => {
    const request = await fetch(`https://palletsapi.onrender.com/items/${itemId}`, {
        method: "PUT",
        Headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({
            "itemName": `${$('#editItemName').val()}`,
            "itemDescription": `${$('#editItemDescription').val()}`,
            "itemPrice": `${$('#editItemPrice').val()}`,
            "palletId": `${$('#palletIdNumber').html()}`,
            "sold": `${$('#editItemSold').val()}`,
            "category": `${$('#editCategory').val()}`,
            "sellDate": `${$('#editSellDate').val()}`,
            "sellPrice": `${$('#editSellPrice').val()}`,
            "platform": `${$('#editPlatform').val()}`,
            "shippingCost": `${$('#editShippingCost').val()}`,
            "miscExpenses": `${$('#editMiscExpenses').val()}`,
            "listDate": `${$('#editListDate').val()}`
        }),
        headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    const data = await request.json()
    console.log(data)
    return data
}

function validateForm() {
    let errors = ''
    if ($('#editItemName').val() == '') {
        errors += 'Item name cannot be empty.\n'
    }
    if ($('#editItemPrice').val() <= 0) {
        errors += 'Retail price must be greater than 0.'
    }
    if ($('editSellPrice') < 0) {
        errors += 'Sell price must be greater than 0.'
    }
    return errors
}

const getItem = async (itemId) => {
    const request = await fetch(`https://palletsapi.onrender.com/items/${itemId}`)
    const data = await request.json()
    return data
}

const itemsInPallet = async (palletId) => {
    const request = await fetch(`https://palletsapi.onrender.com/items/pallet/${palletId}`)
    const data = await request.json()
    return data
}

const getPallet = async (palletId) => {
    const request = await fetch(`https://palletsapi.onrender.com/pallets/${palletId}`)
    const data = await request.json()
    return data
}

const getPalletShippingCost = async (palletId) => {
    const request = await fetch(`https://palletsapi.onrender.com/pallets/shipping/${palletId}`)
    const data = await request.json()
    return data
}

const getPalletMiscExpenses = async (palletId) => {
    const request = await fetch(`https://palletsapi.onrender.com/pallets/miscExpenses/${palletId}`)
    const data = await request.json()
    return data
}

const getPalletNumbers = async (palletId) => {
    const request = await fetch(`https://palletsapi.onrender.com/pallets/numbers/${palletId}`)
    const data = await request.json()
    return data
}

async function populatePage() {
    let itemList = ''
    let palletNumbers = await getPalletNumbers(palletId)
    let palletInfo = await getPallet(palletId)
    let items = await itemsInPallet(palletId)
    $('#palletTitle').html(`<h1>${palletInfo.palletName}</h1>`)
    for (let item of items) {
        itemList += `
            <div class="row border p-3 item-row ${item.sold ? 'item-row-bought' : ''}">
                <div class="col-2">${item.itemName}</div>
                <div class="col-3">${item.itemDescription}</div>
                <div class="col-1">${item.itemPrice}</div>
                <div class="col-1">${item.sellPrice && item.sellPrice != 0 ? item.sellPrice : '-'}</div>
                <div class="col-2">${item.sellDate != null && item.sellDate != '1899-11-30T07:00:00.000Z' ? item.sellDate.split('T')[0] : '-'}</div>
                <div class="col-2">${item.platform != null ? item.platform : '-'}</div>
                <div class="col-1"><i class=" editItemBtn fa-regular fa-pen-to-square edit-item" data-bs-toggle="modal" data-bs-target="#myModal" data-itemId="${item.itemId}"></i></div>
            </div>`
    }
    $('#itemList').html(itemList)
    $('.editItemBtn').click(function() {
        populateForm($(this).attr('data-itemId'))
    })
    $('#costText').html(`$${palletNumbers.cost.toFixed(2)}`)
    $('#shippingText').html(`$${palletNumbers.totalShippingCost.toFixed(2)}`)
    $('#miscExpensesText').html(`$${palletNumbers.totalMiscExpenses.toFixed(2)}`)
    $('#revenueText').html(`$${palletNumbers.revenue.toFixed(2)}`)
    $('#profitText').html(`$${palletNumbers.profit.toFixed(2)}`)
}

async function populateFormDropdowns() { 
    let categoriesInfo = await getCategoriesDropdown()
    let $catDD = $('#editCategory')
    for (let category of categoriesInfo) {
        $catDD.append(`
            <option value="${category.categoryId}">${category.categoryName}</option>
        `)
    }
}

const getCategoriesDropdown = async () => {
    const request = await fetch(`https://palletsapi.onrender.com/categories/dropdown`)
    const data = await request.json()
    return data
}

async function populateForm(itemId) {
    clearForm()
    let itemData = await getItem(itemId) // get current item information to populate form
    let item = itemData[0]
    $('#editItemName').val(item.itemName)
    $('#editItemDescription').val(item.itemDescription)
    $('#editItemPrice').val(item.itemPrice)
    $('#editItemSold').val(item.sold)
    $('#editCategory').val(item.category)
    $('#editSellPrice').val(item.sellPrice)
    $('#editPlatform').val(item.platform)
    $('#idNumber').html(`${item.itemId}`)
    $('#palletIdNumber').html(`${item.palletId}`)
    $('#editShippingCost').val(item.shippingCost)
    $('#editMiscExpenses').val(item.miscExpenses)
    if (item.sellDate != null && item.sellDate != '1899-11-30T07:00:00.000Z') {
        $('#editSellDate').val(item.sellDate.split('T')[0])
    }
    if (item.listDate != null && item.ListDate != '1899-11-30T07:00:00.000Z') {
        $('#editListDate').val(item.listDate.split('T')[0])
    }
} 

function clearForm() {
    $('#editItemName').val('')
    $('#editItemDescription').val('')
    $('#editItemPrice').val('')
    $('#editItemSold').val('')
    $('#editCategory').val('')
    $('#editSellPrice').val('')
    $('#editPlatform').val('')
    $('#editShippingCost').val('')
    $('#editMiscExpenses').val('')
    $('#editSellDate').val('')
    $('#editListDate').val('')
}

