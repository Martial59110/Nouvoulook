
## Configuration de l'URL et du port de l'API

L'URL de l'API backend (et donc le port) est centralisée dans le fichier d'environnement Angular :

- **Développement** : `admin/src/environments/environment.ts`
- **Production** : `admin/src/environments/environment.prod.ts`

Exemple :
```typescript
// admin/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001' // Modifiez ici le port ou le domaine de l'API
};
```

Pour la production, adaptez l'URL dans `environment.prod.ts` :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.nouvoulook.com' // À adapter pour la prod
};
```

### Utilisation dans le code

Dans les services Angular, l'URL de l'API est utilisée ainsi :

```typescript
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth/login';
  // ...
}
```

Pour récupérer la liste des utilisateurs :
```typescript
this.http.get<any[]>(environment.apiUrl + '/users', { ... })
```

### Changer le port de l'API

Pour changer le port (par exemple passer de 3001 à 4000), il suffit de modifier :
```typescript
// admin/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000'
};
```

---

## Authentification et stockage utilisateur

Lors de la connexion, le front stocke :
- `access_token` et `refresh_token` (dans localStorage ou sessionStorage selon "Se souvenir de moi")
- L'objet `user` (contenant `firstname`, `lastname`, `email`, etc.)

Exemple dans le service :
```typescript
setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false, user: any = null) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('access_token', accessToken);
  storage.setItem('refresh_token', refreshToken);
  if (user) {
    storage.setItem('user', JSON.stringify(user));
  }
  // ...
}
```

Pour récupérer l'utilisateur connecté :
```typescript
getUser(): any {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}
```

---

## Appels API protégés

Pour appeler une route protégée de l'API, le front envoie le token dans l'en-tête :
```typescript
this.http.get<any[]>(environment.apiUrl + '/users', {
  headers: {
    Authorization: 'Bearer ' + (localStorage.getItem('access_token') || sessionStorage.getItem('access_token'))
  }
})
```

---

## Résumé
- **Modifiez l'URL/port de l'API dans `environment.ts`** pour tout le projet.
- **Les tokens et l'utilisateur** sont stockés côté navigateur après connexion.
- **Les appels API** utilisent toujours l'URL centralisée et le token pour l'authentification.

Pour toute question, voir le code des services ou contactez le développeur du projet.
