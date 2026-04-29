# 📧 Configuration de Resend pour l'envoi d'emails - Voyago

Ce document explique comment configurer Resend pour l'envoi d'emails transactionnels dans l'application Voyago.

## 🔑 Obtention de la clé API Resend

1. Créez un compte sur [Resend.com](https://resend.com)
2. Connectez-vous à votre tableau de bord
3. Naviguez vers **API Keys** dans le menu latéral
4. Cliquez sur **"Create API Key"**
5. Donnez un nom à votre clé (ex: "voyago-production")
6. Copiez la clé générée (elle commencera par `re_`)

## ⚙️ Configuration dans le projet

### 1. Ajout de la variable d'environnement

Dans le fichier `.env` à la racine du projet API (`api/.env`), ajoutez :

```env
# ... variables existantes ...

# Resend Email Service
RESEND_API_KEY=votre_cle_api_resend_ici
```

### 2. Variables d'environnement pour différentes étapes

Pour les différents environnements, vous pouvez créer des fichiers spécifiques :

- `.env.development` pour le développement
- `.env.staging` pour le pré-production
- `.env.production` pour la production

Chaque fichier devrait contenir :
```env
RESEND_API_KEY=votre_cle_api_specifique_a_l_environnement
```

### 3. Vérification de la configuration

Le service de notification utilise déjà Resend dans `api/src/services/notification/NotificationService.ts` :

```typescript
import { Resend } from 'resend';

export class NotificationService {
  // La clé est automatiquement chargée depuis les variables d'environnement
  private static resend = new Resend(process.env.RESEND_API_KEY);
  
  // Méthodes disponibles :
  async sendBookingConfirmation(bookingData) { /* ... */ }
  async sendPaymentConfirmation(paymentData) { /* ... */ }
  async sendTicketReminder(bookingData) { /* ... */ }
  async sendPasswordReset(email, token) { /* ... */ }
  // etc.
}
```

## 🧪 Test de la configuration

### Test rapide avec Node.js

```bash
# Installez resend si nécessaire
npm install resend

# Puis exécutez ce script de test
node -e "
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY || 'votre_cle_api_test');

resend.emails.send({
  from: 'Voyago <voyago@votredomaine.com>',
  to: 'votre_email@test.com',
  subject: 'Test de configuration Resend',
  html: '<h2>Test réussi !</h2><p>Resend est correctement configuré pour Voyago.</p>'
})
.then(console.log)
.catch(console.error);
"
```

### Test via l'API

Vous pouvez également tester via un endpoint temporaire :

1. Créez un fichier `src/routes/email.test.ts` :
```typescript
import { Router } from 'express';
import { NotificationService } from '../services/notification/NotificationService';

const router = Router();
const notificationService = new NotificationService();

router.get('/test-send-email', async (req, res) => {
  try {
    await notificationService.sendBookingConfirmation({
      passengerName: 'Utilisateur Test',
      tripDetails: {
        departure: 'Lomé',
        arrival: 'Kpalimé',
        date: '2026-05-01',
        time: '10:00'
      },
      bookingReference: 'TEST123',
      seatNumber: '5A'
    });
    
    res.status(200).json({ message: 'Email de test envoyé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Échec de l\'envoi d\'email', details: error.message });
  }
});

export default router;
```

2. Importez ce routeur dans `src/routes/index.ts` :
```typescript
// ... autres imports
import emailTestRoutes from './email.test';

// ... autres routes
router.use('/email-test', emailTestRoutes);
```

3. Testez avec :
```bash
curl http://localhost:5000/api/v1/email-test/test-send-email
```

## 📝 Types d'emails actuellement supportés

Le service `NotificationService` prend en charge l'envoi de :

- **Emails de confirmation de réservation** (`sendBookingConfirmation`)
- **Emails de confirmation de paiement** (`sendPaymentConfirmation`)
- **Emails de rappel de voyage** (`sendTicketReminder`)
- **Emails de réinitialisation de mot de passe** (`sendPasswordReset`)
- **Emails de bienvenue** (`sendWelcomeEmail`)
- **Notifications de retard** (`sendDelayNotification`)
- **Et plus encore...**

## 🔒 Bonnes pratiques de sécurité

1. **Ne jamais commiter votre clé API** : Assurez-vous que `.env` est bien dans votre `.gitignore`
2. **Utiliser des clés différentes par environnement** : Développement, staging et production doivent avoir des clés distinctes
3. **Surveiller l'utilisation** : Resend fournit un tableau de bord pour suivre vos envois et votre quota
4. **Configurer les domaines vérifiés** : Dans Resend, vérifiez votre domaine pour améliorer la délivrabilité
5. **Utiliser des adresses d'expéditeur professionnelles** : Configurez un sous-domaine comme `mail.votredomaine.com` pour les emails

## 📈 Monitoring et analytics

Resend fournit des analytics détaillés dans son tableau de bord :
- Taux de délivrabilité
- Taux d'ouverture
- Taux de clics
- Bounces et spams

Vous pouvez également configurer des webhooks pour recevoir des notifications en temps réel sur les événements d'email.

## 🔄 Migration depuis un autre service

Si vous migrez depuis un autre service d'email (SendGrid, Mailgun, etc.) :
1. Les modèles d'email peuvent nécessiter des ajustements légers (Resend utilise React pour ses emails par défaut)
2. Les mêmes méthodes d'API sont utilisées, donc le changement devrait être transparent
3. Testez absolument tous types d'emails avant de basculer en production

## 📞 Support et dépannage

En cas de problèmes :
1. Vérifiez que votre clé API est correctement copiée dans les variables d'environnement
2. Consultez les logs de l'application pour les erreurs spécifiques
3. Visitez la documentation Resend : https://resend.com/docs
4. Contactez le support Resend si nécessaire (disponible même en plan gratuit)

---
*Documentation mise à jour le : 2026-04-26*