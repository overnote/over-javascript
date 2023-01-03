function getDate(date: string): Date[] {
    let d = new Date(date)
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        return []
    }

    return [d]
}

function test() {
    let date = getDate('hh')

    date.map((item) => {
        item.toString()
    }).forEach((item) => {
        console.log('Date is: ', item)
    })
}

test()
