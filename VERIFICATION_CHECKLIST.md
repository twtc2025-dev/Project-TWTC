# ✅ Vérification du déploiement - TWTC Referral System

**Date:** Février 2026  
**État:** En attente de vérification post-déploiement

---

## 🚀 État du déploiement

### Commits poussés sur `main`
```
✅ fix: ESM imports (.js) and add api/auth/google.ts for proper module resolution
✅ chore: remove legacy extensionless api/auth/google to avoid conflicts
✅ fix(api): use .js extensions for internal imports; make auth/google default export a handler
✅ Rebase avec remote + Push successful
```

### Vercel Auto-Deploy
- ⏳ En attente de déploiement automatique (Vercel devrait déclencher après le push)
- URL de production attendue : `https://twtc-mining.vercel.app`

---

## 🧪 Tests à effectuer

### 1. Health Check Endpoint

**Endpoint :** `GET /api/health`

**Commande :**
```bash
curl -s https://twtc-mining.vercel.app/api/health | jq .
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "mongodb": "connected",
  "timestamp": "2026-02-04T..."
}
```

**Diagnostic :**
- Si `mongodb: "disconnected"` → Vérifier `MONGODB_URI` dans Vercel Environment Variables
- Si réponse 404 → Vercel n'a pas encore fini le déploiement

---

### 2. Google OAuth Integration

**Étapes manuelles (via navigateur) :**
1. Accédez à `https://twtc-mining.vercel.app`
2. Cliquez sur "Sign in with Google"
3. Autorisez l'application
4. Vous devriez voir votre profil utilisateur avec un **Referral Code**

**Diagnostic :**
- Si redirection échoue → Vérifier que Google OAuth Redirect URI est configuré :
  - Google Cloud Console → OAuth 2.0 Client IDs
  - Authorized redirect URIs doit inclure : `https://twtc-mining.vercel.app/api/auth/google/callback`
- Si pas de Referral Code → Vérifier MongoDB connection et logs Vercel

---

### 3. Referral API Endpoint

**Endpoint :** `GET /api/referral/me`

**Prérequis :** Vous devez être connecté (avoir un cookie de session valide)

**Commande (après login) :**
```bash
# Depuis le navigateur - ouvrir la console DevTools (F12)
fetch('https://twtc-mining.vercel.app/api/referral/me', {
  credentials: 'include'
}).then(r => r.json()).then(d => console.log(d))
```

**Réponse attendue :**
```json
{
  "success": true,
  "referralCode": "ABC-1X2Y3",
  "referralLink": "https://twtc-mining.vercel.app/signup?ref=ABC-1X2Y3",
  "totalReferrals": 0,
  "activeReferrals": 0,
  "rewardedReferrals": 0
}
```

**Diagnostic :**
- Si `"success": false, "error": "Unauthorized"` → Session non valide (reconnectez-vous)
- Si erreur MongoDB → Vérifier `MONGODB_URI`

---

### 4. Referral Stats Endpoint

**Endpoint :** `GET /api/referral/stats`

**Commande (après login) :**
```bash
fetch('https://twtc-mining.vercel.app/api/referral/stats', {
  credentials: 'include'
}).then(r => r.json()).then(d => console.log(d))
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "totalReferrals": 0,
    "pendingReferrals": 0,
    "confirmedReferrals": 0,
    "rewardedReferrals": 0,
    "totalRewardsEarned": 0,
    "referralsList": []
  }
}
```

---

## 🔐 Variables d'environnement requises (Vercel)

Vérifiez que toutes ces variables sont présentes dans **Vercel Dashboard → Settings → Environment Variables** :

| Variable | Valeur | ✓ |
|----------|--------|---|
| `MONGODB_URI` | `mongodb+srv://...` | ☐ |
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | ☐ |
| `GOOGLE_CLIENT_SECRET` | `...` | ☐ |
| `SESSION_SECRET` | `...` (clé forte) | ☐ |
| `NODE_ENV` | `production` | ☐ |
| `VITE_API_URL` | `https://twtc-mining.vercel.app` | ☐ |

---

## 📋 Checklist de vérification

- [ ] Commit poussé sur GitHub `main` branch
- [ ] Vercel a commencé le déploiement (visible dans Vercel Dashboard)
- [ ] Déploiement terminé avec succès ✅
- [ ] GET `/api/health` retourne status "ok"
- [ ] GET `/api/health` retourne mongodb "connected"
- [ ] Connexion Google OAuth fonctionne
- [ ] Referral Code visible après connexion
- [ ] GET `/api/referral/me` retourne les données utilisateur
- [ ] GET `/api/referral/stats` retourne statistiques
- [ ] Aucune erreur 500 dans les logs

---

## 🔧 Dépannage rapide

### Vercel Dashboard
1. Accédez à : https://vercel.com/dashboard/twtc2025-dev/Project-TWTC
2. Consultez l'onglet **Deployments** pour voir l'état
3. Cliquez sur le dernier déploiement pour voir les logs complets
4. Vérifiez **Settings → Environment Variables** pour les valeurs

### Logs Vercel (via CLI)
```bash
# Si connecté au CLI
vercel logs https://twtc-mining.vercel.app --since 1h
```

### Erreurs courantes

**Erreur :** `Cannot find module '/var/task/api/lib/mongodb'`
- **Cause :** Import ESM sans extension `.js`
- **Solution :** Vérifier que tous les imports internes dans `api/` utilisent `.js`
- **Fichiers concernés :** `api/routes/*.ts`, `api/services/*.ts`

**Erreur :** `Invalid export found in module "api/auth/google.js"`
- **Cause :** Export par défaut non-fonction
- **Solution :** Export par défaut doit être une fonction handler
- **Status :** ✅ Corrigé dans le commit récent

**Erreur :** `Unauthorized` sur `/api/referral/me`
- **Cause :** Session non valide ou pas de cookie
- **Solution :** Reconnecter via Google OAuth

**Erreur :** `mongodb: "disconnected"` sur `/api/health`
- **Cause :** `MONGODB_URI` incorrect ou MongoDB Atlas IP whitelist
- **Solution :**
  1. Vérifier `MONGODB_URI` dans Vercel Environment Variables
  2. Vérifier IP Whitelist dans MongoDB Atlas (ajouter Vercel IPs)

---

## 📞 Prochaines étapes

1. **Attendez le déploiement** (2-5 minutes après push)
2. **Vérifiez l'état dans Vercel Dashboard**
3. **Testez chaque endpoint** selon les instructions ci-dessus
4. **Signalez les erreurs** avec les logs détaillés

---

**Mise à jour :** Prêt pour vérification  
**Dépôt :** https://github.com/twtc2025-dev/Project-TWTC  
**Production :** https://twtc-mining.vercel.app
