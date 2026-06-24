// One-off admin script: delete ALL Firebase Auth accounts in the target project.
// Pairs with the Firestore `users/*` wipe (`firebase firestore:delete users …`)
// for a FULL learner reset — accounts AND data — rather than just clearing
// progress. Firestore and Auth are separate stores; this script handles Auth.
//
// Needs Application Default Credentials for the real project (same as the prod
// seed path):
//   gcloud auth application-default login   # or set GOOGLE_APPLICATION_CREDENTIALS
//   GOOGLE_CLOUD_PROJECT=brilliant-org ./node_modules/.bin/tsx scripts/delete-auth-users.ts
//
// listUsers pages at <=1000; deleteUsers takes <=1000 uids/call and treats
// already-absent uids as success, so re-running is safe/idempotent.

import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const projectId =
  process.env.GOOGLE_CLOUD_PROJECT ??
  process.env.GCLOUD_PROJECT ??
  'brilliant-org'

async function main(): Promise<void> {
  initializeApp({ projectId, credential: applicationDefault() })
  const auth = getAuth()

  const uids: string[] = []
  let pageToken: string | undefined
  do {
    const page = await auth.listUsers(1000, pageToken)
    uids.push(...page.users.map((u) => u.uid))
    pageToken = page.pageToken
  } while (pageToken)

  if (uids.length === 0) {
    console.log(`No accounts to delete in ${projectId}.`)
    return
  }

  console.log(`Deleting ${uids.length} account(s) from ${projectId}…`)
  let deleted = 0
  for (let i = 0; i < uids.length; i += 1000) {
    const res = await auth.deleteUsers(uids.slice(i, i + 1000))
    deleted += res.successCount
    res.errors.forEach((e) => console.error('  failed:', e.error.message))
  }
  console.log(`Done. Deleted ${deleted} account(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n✗ Delete failed:\n', err)
    process.exit(1)
  })
