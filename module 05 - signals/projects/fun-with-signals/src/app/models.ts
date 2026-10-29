export type ExperienceRole = 'manager' | 'developer' | 'designer' | 'tester';

export interface Person {
    readonly name: string;
    readonly age: number;
    readonly email: string;
    readonly address: Address;
    readonly experience: ExperienceItem[];
}

export interface Address {
    readonly street: string;
    readonly city: string;
    readonly zip: string;
}

export interface ExperienceItem {
    readonly company: string;
    readonly role: ExperienceRole;
    readonly startDate: string;
    readonly endDate?: string;
}