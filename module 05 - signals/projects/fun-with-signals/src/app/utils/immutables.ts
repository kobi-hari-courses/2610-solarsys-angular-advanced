export function changeItem<T>(array: T[], 
    picker: (item: T, index: number) => boolean, 
    changer: (item: T, index: number) => Partial<T>
): T[] {
    return array.map((item, index) => picker(item, index)
        ? {...item , ...changer(item, index)}
        : item
)

}

const points = [
    {x: 2, y: 3, z: 5}, 
    {x: 4, y: 1, z: 7}, 
    {x: 1, y: 2, z: 3}, 
    {x: 2, y: 4, z: 1}
]

const newPoints = changeItem(points, p => p.x === 2, (p, i) => ({x: p.x + i}))
