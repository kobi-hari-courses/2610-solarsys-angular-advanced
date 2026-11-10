import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { User } from "../models/user.model";

@Service()
export class DataService {
    readonly #http = inject(HttpClient);
    readonly #baseUrl = 'http://localhost:3000';


    getAllUsers() {
        const url = `${this.#baseUrl}/users`;
        const res = this.#http.get<User[]>(url);
        return res;
    }

    addNewUser(name: string, email: string) {
        const newUser: User = {
            name,
            email, 
            id: crypto.randomUUID()
        }
        const url = `${this.#baseUrl}/users`;
        const res = this.#http.post<User>(url, newUser);
        return res;
    }

    deleteUser(id: string) {
        const url = `${this.#baseUrl}/users/${id}`;
        const res = this.#http.delete<{}>(url);
        return res;
    }

}