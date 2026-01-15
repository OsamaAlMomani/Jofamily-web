# Phase 6 Startup Guide

**Quick Start**: Prepare environment and begin banking layer.

---

## Week 1: Environment & Banking Setup

### Prerequisites Checklist

#### External Accounts
- [ ] Create Plaid account (https://plaid.com) - Free developer tier
- [ ] Stripe Connect account (payment processing)
- [ ] Cryptocurrency.com account (API access)
- [ ] Vertex AI project access (Google Cloud)
- [ ] Create GitHub Actions secrets for API keys
- [ ] Request Slack app credentials for workspace

#### Development Tools
- [ ] Node.js 20+ installed
- [ ] `gcloud` CLI configured with Phase 5 GCP project
- [ ] Docker installed (for local Firebase emulator)
- [ ] Postman/Insomnia for API testing

### Step 1: Set Up Banking Service Module

```bash
# In project root
mkdir -p src/services/banking
mkdir -p src/services/ai/agents
mkdir -p src/services/integrations
mkdir -p src/services/compliance
mkdir -p src/services/analytics
```

### Step 2: Install Banking Dependencies

```bash
npm install plaid stripe @cryptocurrency/api @google-cloud/aiplatform
npm install --save-dev @types/plaid
```

### Step 3: Configure Plaid

```bash
# Set environment variables
export PLAID_CLIENT_ID="your_plaid_client_id"
export PLAID_SECRET="your_plaid_secret"
export PLAID_ENV="sandbox"  # or production
```

### Step 4: Initialize Plaid Service

```typescript
// src/services/banking/plaidService.ts
import { PlaidApi, Configuration } from 'plaid';

const configuration = new Configuration({
  basePath: 'https://sandbox.plaid.com',  // or production URL
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);
```

### Step 5: Add Plaid Link Component (React)

```tsx
// src/components/PlaidLink.tsx
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link';

export const PlaidLinkComponent: React.FC<{ onSuccess: (data: any) => void }> = ({ onSuccess }) => {
  const config: PlaidLinkOptions = {
    token: '', // Exchange for link_token from backend
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  return <button onClick={() => open()} disabled={!ready}>Link Bank Account</button>;
};
```

### Step 6: Create Link Token Endpoint

```typescript
// functions/src/banking/createLinkToken.ts
import { plaidClient } from '../services/banking/plaidService';

export const createLinkToken = async (userId: string) => {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'JoFamily',
    language: 'en',
    products: ['transactions', 'auth'],
    country_codes: ['US', 'GB', 'DE', 'FR', 'ES', 'NL', 'IT', 'CA'],
  });

  return response.data.link_token;
};
```

### Step 7: Exchange Public Token for Access Token

```typescript
// Exchange happens after user completes Plaid Link flow
export const exchangePublicToken = async (publicToken: string) => {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const accessToken = response.data.access_token;
  
  // Store securely in Firestore with encryption
  await db.collection('users').doc(userId).update({
    plaid_access_token: encryptSensitiveData(accessToken),
    linked_accounts: firestore.FieldValue.increment(1),
  });

  return accessToken;
};
```

### Step 8: Sync Transactions

```typescript
// functions/src/banking/syncTransactions.ts
import { pubsub } from 'firebase-functions';

export const syncTransactions = pubsub
  .schedule('*/10 * * * *')  // Every 10 minutes
  .onRun(async (context) => {
    const users = await db.collection('users').where('linked_accounts', '>', 0).get();

    for (const userDoc of users.docs) {
      const accessToken = decryptSensitiveData(userDoc.data().plaid_access_token);
      
      const txResponse = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
      });

      // Save transactions to Firestore
      for (const tx of txResponse.data.transactions) {
        await db.collection('transactions').doc(tx.transaction_id).set({
          user_id: userDoc.id,
          amount: tx.amount,
          category: tx.personal_finance_category?.primary,
          description: tx.name,
          date: new Date(tx.date),
          synced_at: new Date(),
        });
      }
    }
  });
```

---

## Week 2-3: AI Agents & Automation

### Budget Optimization Agent

```typescript
// functions/src/ai/agents/budgetAgent.ts
export const optimizeBudgets = pubsub
  .schedule('0 2 * * *')  // Daily at 2 AM UTC
  .onRun(async () => {
    const families = await db.collection('families').get();

    for (const familyDoc of families.docs) {
      const budgets = await db.collection('families').doc(familyDoc.id).collection('budgets').get();
      const expenses = await db.collection('families').doc(familyDoc.id).collection('expenses')
        .where('date', '>=', moment().subtract(30, 'days').toDate())
        .get();

      const insights: any[] = [];

      for (const budgetDoc of budgets.docs) {
        const budget = budgetDoc.data();
        const categoryExpenses = expenses.docs.filter(e => e.data().category === budget.category);
        const spent = categoryExpenses.reduce((sum, e) => sum + e.data().amount, 0);

        if (spent < budget.limit * 0.5) {
          insights.push({
            category: budget.category,
            message: `You're spending 50% less than budgeted. Consider reducing limit by $${(budget.limit * 0.5).toFixed(2)}`,
            potential_savings: budget.limit * 0.5,
          });
        } else if (spent > budget.limit * 0.9) {
          insights.push({
            category: budget.category,
            message: `You're approaching your ${budget.category} budget limit!`,
            urgency: 'high',
          });
        }
      }

      // Save insights
      if (insights.length > 0) {
        await db.collection('families').doc(familyDoc.id).collection('insights').add({
          insights,
          generated_at: new Date(),
          type: 'budget_optimization',
        });

        // Notify users
        await sendNotification(familyDoc.id, {
          title: `Budget Insights for ${familyDoc.data().name}`,
          body: `${insights.length} optimization opportunities found`,
        });
      }
    }
  });
```

---

## Week 4: Integrations - Slack Bot

### Setup Slack App

```bash
# 1. Go to https://api.slack.com/apps
# 2. Create New App > From manifest
# 3. Paste this manifest:

```yaml
{
  "display_information": {
    "name": "JoFamily",
    "description": "Family budget management",
    "background_color": "#3B82F6"
  },
  "features": {
    "bot_user": {
      "display_name": "jofamily",
      "always_online": true
    }
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "chat:write",
        "commands",
        "users:read",
        "channels:read"
      ]
    }
  },
  "settings": {
    "slash_commands": [
      {
        "command": "/jofamily",
        "url": "https://your-function-url.cloudfunctions.net/slackCommand",
        "description": "JoFamily budget commands"
      }
    ]
  }
}
```

### Slack Handler

```typescript
// functions/src/integrations/slackHandler.ts
export const slackCommand = https.onRequest(async (req, res) => {
  const { token, team_id, user_id, text, command } = req.body;

  // Verify token
  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    res.status(401).send('Unauthorized');
    return;
  }

  const userId = await mapSlackUserToJoFamily(team_id, user_id);

  if (text.startsWith('budget')) {
    const parts = text.split(' ');
    
    if (parts[1] === 'show') {
      const budgets = await getBudgets(userId);
      res.json({
        response_type: 'in_channel',
        blocks: budgets.map(b => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${b.category}*: $${b.spent}/$${b.limit}`,
          },
        })),
      });
    } else if (parts[1] === 'set') {
      // /jofamily budget set housing 2000
      const category = parts[2];
      const limit = parseFloat(parts[3]);

      await setBudget(userId, category, limit);
      res.json({
        response_type: 'ephemeral',
        text: `Budget set: ${category} → $${limit}`,
      });
    }
  }
});
```

---

## Week 5-6: Testing & Validation

### Integration Tests

```typescript
// tests/banking/plaid.test.ts
describe('Plaid Integration', () => {
  it('should create link token', async () => {
    const token = await createLinkToken('test_user');
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(0);
  });

  it('should sync transactions', async () => {
    const result = await syncTransactions();
    expect(result.success).toBe(true);
  });
});
```

### Load Testing

```bash
# Using Artillery
npm install -g artillery

artillery quick --count 100 --num 10 https://your-api.com/transactions
```

---

## Week 6-7: Deployment

### Deploy to Firebase Functions

```bash
firebase deploy --only functions
```

### Enable Required APIs

```bash
# In GCP Console or via gcloud
gcloud services enable \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudfunctions.googleapis.com
```

---

## Phase 6 Kickoff Checklist

- [ ] Plaid sandbox environment set up
- [ ] Banking service module created
- [ ] First transaction sync working
- [ ] Slack bot responding to commands
- [ ] Budget optimization agent running daily
- [ ] Alert notifications sent successfully
- [ ] All integrations tested locally
- [ ] Firebase Functions deployed
- [ ] Monitoring & alerts configured
- [ ] Security audit passed

---

## Success Metrics (Week 7)

✅ 100+ test users linked bank accounts  
✅ 1000+ transactions synced daily  
✅ <500ms Plaid API response time (p95)  
✅ 99% notification delivery rate  
✅ 0 security incidents  

Ready to scale Phase 6!
