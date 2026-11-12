export function sum<T>(items: T[], picker: (item: T) => number): number {
    const numbers = items.map(picker);
    return numbers.reduce((acc, next) => acc + next, 0);
}

export function max(numbers: number[]): number {
    return numbers.reduce((acc, next) => acc > next ? acc : next)
}

export function distinct<T>(items: T[], picker: (item: T) => string): string[] {
    const allAkeys = items.map(picker);
    const keys = allAkeys.reduce((acc, next) => ({
        ...acc, 
        [next]: true
    }), {} as Record<string, boolean>);

    return Object.keys(keys);
}
