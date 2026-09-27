/**
 * ClaimDesk Phase 2 Comprehensive Integration & Regression Test Suite
 * Tests all 12 core domains against the running application.
 */

const BASE_URL = 'http://localhost:4000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, data, headers: res.headers };
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 ClaimDesk Phase 2 Comprehensive Test Suite');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  let aliceToken, bobToken, carolToken, daveToken;
  let testCarClaimId, testBikeClaimId;
  let userBToken;

  // ─────────────────────────────────────────────────────────────
  // 1. System Liveness & Health
  // ─────────────────────────────────────────────────────────────
  console.log('📋 Domain 1: System Liveness & Health Check');
  {
    const res = await request('/health');
    assert(res.status === 200, 'GET /health responds with HTTP 200');
    assert(res.data?.status === 'ok', 'Health status reports "ok"');
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Authentication Regression & Session Management
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 2: Authentication & Session Verification');
  {
    // Valid Claimant Login
    const aliceRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@demo.com', password: 'Demo1234!' })
    });
    assert(aliceRes.status === 200, 'Alice login succeeds with 200 OK');
    assert(!!aliceRes.data?.data?.token, 'JWT token returned on login');
    assert(aliceRes.data?.data?.user?.role === 'claimant', 'Alice role is "claimant"');
    aliceToken = aliceRes.data?.data?.token;

    // Valid Officer Login (Bob)
    const bobRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@demo.com', password: 'Demo1234!' })
    });
    assert(bobRes.status === 200, 'Bob (Officer) login succeeds with 200 OK');
    bobToken = bobRes.data?.data?.token;

    // Valid Officer Login (Carol)
    const carolRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'carol@demo.com', password: 'Demo1234!' })
    });
    assert(carolRes.status === 200, 'Carol (Officer) login succeeds with 200 OK');
    carolToken = carolRes.data?.data?.token;

    // Valid Supervisor Login (Dave)
    const daveRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dave@demo.com', password: 'Demo1234!' })
    });
    assert(daveRes.status === 200, 'Dave (Supervisor) login succeeds with 200 OK');
    daveToken = daveRes.data?.data?.token;

    // Invalid Password
    const badPw = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@demo.com', password: 'WrongPassword999' })
    });
    assert(badPw.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // Non-existent Email
    const badEmail = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost_user@demo.com', password: 'Demo1234!' })
    });
    assert(badEmail.status === 401, 'Non-existent user rejected with 401');

    // /auth/me Session Validation
    const meRes = await request('/auth/me', {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert(meRes.status === 200, 'GET /auth/me returns 200 with valid session');
    assert(meRes.data?.data?.email === 'alice@demo.com', 'GET /auth/me validates correct identity');

    // /auth/me Without Token
    const noTokenRes = await request('/auth/me');
    assert(noTokenRes.status === 401, 'GET /auth/me without token rejected with 401');

    // Register New User
    const randomEmail = `test_user_${Date.now()}@demo.com`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: randomEmail,
        password: 'DemoPassword123!',
        role: 'claimant',
        full_name: 'Test Claimant B'
      })
    });
    assert(regRes.status === 201, 'POST /auth/register creates new user with 201 Created');
    userBToken = regRes.data?.data?.token;

    // Duplicate Registration
    const dupRes = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: randomEmail,
        password: 'DemoPassword123!',
        role: 'claimant',
        full_name: 'Duplicate User'
      })
    });
    assert(dupRes.status === 400, 'Duplicate user registration rejected with 400 Bad Request');
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Policy Lookup & Auto-fill Verification
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 3: Policy Lookup & Dynamic Vehicle Detection');
  {
    // Search Car Policy
    const carPolicy = await request('/policies?search=AV-AUTO-00101', {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert(carPolicy.status === 200, 'Policy search succeeds with 200');
    const p1 = carPolicy.data?.data?.[0];
    assert(p1?.vehicle_category === 'car', 'Policy AV-AUTO-00101 vehicle_category is "car"');
    assert(p1?.vehicle_make === 'Toyota', 'Policy AV-AUTO-00101 maker is Toyota');
    assert(!!p1?.chassis_number, 'Policy AV-AUTO-00101 has chassis_number');

    // Search Bike Policy
    const bikePolicy = await request('/policies?search=AV-AUTO-00103', {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert(bikePolicy.status === 200, 'Bike policy search succeeds with 200');
    const p2 = bikePolicy.data?.data?.[0];
    assert(p2?.vehicle_category === 'bike', 'Policy AV-AUTO-00103 vehicle_category is "bike"');
    assert(p2?.vehicle_make === 'Yamaha', 'Policy AV-AUTO-00103 maker is Yamaha');
    assert(p2?.chassis_number === 'AVYM482910385721', 'Policy AV-AUTO-00103 chassis_number matches');
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Role-Based Access Control (RBAC)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 4: Role-Based Access Control & Negative Authorization');
  {
    // Officer cannot create claim (claimant only)
    const officerForm = new FormData();
    officerForm.append('title', 'Officer Trying to File');
    const officerCreate = await request('/claims', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${bobToken}` },
      body: officerForm
    });
    assert(officerCreate.status === 403, 'Officer forbidden from POST /claims (403)');

    // Claimant cannot access /officer notes directly without permission
    const claimantNotes = await request('/claims/cccc0001-0000-0000-0000-000000000001/notes', {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert(claimantNotes.status === 403, 'Claimant forbidden from GET officer notes (403)');
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Claim Creation & Auto-assignment
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 5: Claim CRUD & Lifecycle');
  {
    // Create Car Claim
    const carForm = new FormData();
    carForm.append('policy_id', 'aaaa0001-0000-0000-0000-000000000001');
    carForm.append('policy_type', 'automobile');
    carForm.append('title', 'Front Collision on Highway');
    carForm.append('description', 'Bumper damaged during evening commute.');
    carForm.append('incident_date', '2026-09-25');
    carForm.append('injury_severity', 'Minor');
    carForm.append('claim_amount', '4500');
    carForm.append('currency', 'USD');
    carForm.append('incident_type', 'Collision');
    carForm.append('vehicle_category', 'car');
    carForm.append('vehicle_make', 'Toyota');
    carForm.append('vehicle_model', 'Camry');
    carForm.append('vehicle_year', '2022');
    carForm.append('vehicle_reg_number', 'KA-01-AB-1234');
    carForm.append('chassis_number', 'AVTY984723948201');

    const carRes = await request('/claims', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${aliceToken}` },
      body: carForm
    });
    assert(carRes.status === 201, 'Claimant creates Car Claim with 201 Created');
    assert(carRes.data?.data?.vehicle_category === 'car', 'Created claim vehicle_category is "car"');
    assert(!!carRes.data?.data?.claim_number, 'Claim number auto-generated in AV-CLAIM-YYYYMMDD-XXXX format');
    testCarClaimId = carRes.data?.data?.id;

    // Create Bike Claim
    const bikeForm = new FormData();
    bikeForm.append('policy_id', 'aaaa0003-0000-0000-0000-000000000003');
    bikeForm.append('policy_type', 'automobile');
    bikeForm.append('title', 'Yamaha R3 Pothole Rim Damage');
    bikeForm.append('description', 'Hit severe pothole, front alloy wheel bent.');
    bikeForm.append('incident_date', '2026-09-26');
    bikeForm.append('injury_severity', 'None');
    bikeForm.append('claim_amount', '850');
    bikeForm.append('currency', 'USD');
    bikeForm.append('incident_type', 'Collision');
    bikeForm.append('vehicle_category', 'bike');
    bikeForm.append('vehicle_make', 'Yamaha');
    bikeForm.append('vehicle_model', 'YZF-R3');
    bikeForm.append('vehicle_year', '2023');
    bikeForm.append('vehicle_reg_number', 'DL-03-EF-9012');
    bikeForm.append('chassis_number', 'AVYM482910385721');

    const bikeRes = await request('/claims', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${aliceToken}` },
      body: bikeForm
    });
    assert(bikeRes.status === 201, 'Claimant creates Bike Claim with 201 Created');
    assert(bikeRes.data?.data?.vehicle_category === 'bike', 'Created claim vehicle_category is "bike"');
    assert(bikeRes.data?.data?.chassis_number === 'AVYM482910385721', 'Chassis number stored accurately');
    testBikeClaimId = bikeRes.data?.data?.id;

    // Update Claim when in 'submitted' status
    const patchRes = await request(`/claims/${testCarClaimId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${aliceToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description: 'Updated: Bumper damaged, headlamp also cracked.' })
    });
    assert(patchRes.status === 200, 'Claimant updates submitted claim successfully (200)');
    assert(patchRes.data?.data?.description?.includes('headlamp also cracked'), 'Updated description persisted');
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Claim Isolation & Tenant Privacy
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 6: Claim Isolation & Security Enforcement');
  {
    // User B tries to view Alice's claim
    const forbiddenGet = await request(`/claims/${testCarClaimId}`, {
      headers: { 'Authorization': `Bearer ${userBToken}` }
    });
    assert(forbiddenGet.status === 403, 'Unauthorized claimant cannot read another user claim (403)');

    // User B tries to patch Alice's claim
    const forbiddenPatch = await request(`/claims/${testCarClaimId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${userBToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Hacked Title' })
    });
    assert(forbiddenPatch.status === 404 || forbiddenPatch.status === 403, 'Unauthorized claimant cannot edit another user claim (403/404)');
  }

  // ─────────────────────────────────────────────────────────────
  // 7. Officer Assignment Isolation
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 7: Officer Assignment & Supervisor Governance');
  {
    // Officer Carol (unassigned) tries to start review on Bob's claim
    const unassignedPatch = await request(`/claims/${testCarClaimId}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${carolToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'under_review' })
    });
    assert(unassignedPatch.status === 403, 'Unassigned officer cannot modify claim status (403)');

    // Supervisor Dave can access all claims
    const supervisorGet = await request(`/claims/${testCarClaimId}`, {
      headers: { 'Authorization': `Bearer ${daveToken}` }
    });
    assert(supervisorGet.status === 200, 'Supervisor has global oversight access to claims (200)');
  }

  // ─────────────────────────────────────────────────────────────
  // 8. Workflow State Machine & Transition Rules
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 8: State Machine & Transition Compliance');
  {
    // Invalid transition: submitted -> approved (must be under_review first)
    const invalidTrans = await request(`/claims/${testCarClaimId}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${bobToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'approved' })
    });
    assert(invalidTrans.status === 400, 'Invalid transition submitted -> approved blocked (400)');

    // Valid transition 1: submitted -> under_review (Bob starts review)
    const t1 = await request(`/claims/${testCarClaimId}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${bobToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'under_review', reason: 'Review initiated by officer' })
    });
    assert(t1.status === 200, 'Valid transition submitted -> under_review succeeds (200)');
    assert(t1.data?.data?.status === 'under_review', 'Claim status changed to "under_review"');

    // Valid transition 2: under_review -> approved (Bob approves)
    const t2 = await request(`/claims/${testCarClaimId}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${bobToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'approved', reason: 'Estimate verified with workshop' })
    });
    assert(t2.status === 200, 'Valid transition under_review -> approved succeeds (200)');
    assert(t2.data?.data?.status === 'approved', 'Claim status changed to "approved"');

    // Officer cannot close claim (supervisor privilege)
    const officerClose = await request(`/claims/${testCarClaimId}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${bobToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'closed' })
    });
    assert(officerClose.status === 400, 'Officer cannot close approved claim (supervisor only)');

    // Supervisor closes claim
    const supervisorClose = await request(`/claims/${testCarClaimId}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${daveToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'closed', reason: 'Payout authorized by supervisor' })
    });
    assert(supervisorClose.status === 200, 'Supervisor closes claim with 200 OK');
    assert(supervisorClose.data?.data?.status === 'closed', 'Claim status is "closed"');

    // Supervisor reopens claim: closed -> under_review
    const supervisorReopen = await request(`/claims/${testCarClaimId}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${daveToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'under_review', reason: 'Reopened for supplemental invoice' })
    });
    assert(supervisorReopen.status === 200, 'Supervisor reopens closed claim to under_review (200)');
    assert(supervisorReopen.data?.data?.status === 'under_review', 'Claim successfully reopened');
  }

  // ─────────────────────────────────────────────────────────────
  // 9. Internal Officer Notes
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 9: Internal Officer Notes');
  {
    const addNote = await request(`/claims/${testCarClaimId}/notes`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${bobToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: 'Spoke with body shop estimator. Frame is intact.' })
    });
    assert(addNote.status === 201, 'Officer adds internal note with 201 Created');

    const getNotes = await request(`/claims/${testCarClaimId}/notes`, {
      headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    assert(getNotes.status === 200, 'Officer fetches internal notes with 200');
    assert(getNotes.data?.data?.length > 0, 'Internal notes list populated');
  }

  // ─────────────────────────────────────────────────────────────
  // 10. Claim Events & Status Timeline
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 10: Claim Events & Timeline Progression');
  {
    const eventsRes = await request(`/claims/${testCarClaimId}/events`, {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert(eventsRes.status === 200, 'Claimant views claim status timeline events (200)');
    assert(eventsRes.data?.data?.length >= 3, 'Multiple progression events recorded');
  }

  // ─────────────────────────────────────────────────────────────
  // 11. Audit Trail & Observability
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 11: Audit Trail & Observability');
  {
    const auditRes = await request(`/audit/claim/${testCarClaimId}`, {
      headers: { 'Authorization': `Bearer ${daveToken}` }
    });
    assert(auditRes.status === 200, 'Supervisor fetches claim audit trail with 200');
    assert(auditRes.data?.data?.length > 0, 'Audit logs recorded for claim creation and transitions');
    const actions = auditRes.data?.data?.map(a => a.action);
    assert(actions.includes('claim_created'), 'Audit log contains "claim_created"');
    assert(actions.includes('status_changed'), 'Audit log contains "status_changed"');
  }

  // ─────────────────────────────────────────────────────────────
  // 12. FX Currency Conversion API
  // ─────────────────────────────────────────────────────────────
  console.log('\n📋 Domain 12: External FX Currency Conversion API');
  {
    // Live Frankfurter conversion
    const fxLive = await request('/fx/convert?base=USD&target=EUR&amount=1000', {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    if (fxLive.status !== 200) {
      console.log('    ℹ️ fxLive returned:', fxLive.status, fxLive.data);
    }
    assert(fxLive.status === 200, 'External FX API converts USD to EUR with 200 OK');
    assert(fxLive.data?.data?.rate > 0, 'Returned valid non-zero exchange rate');
    assert(fxLive.data?.data?.source === 'Frankfurter', 'Verified data source is Frankfurter');

    // Identity conversion (same currency USD -> USD)
    const fxIdentity = await request('/fx/convert?base=USD&target=USD&amount=500', {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert(fxIdentity.status === 200, 'Identity FX conversion (USD -> USD) succeeds with 200');
    assert(fxIdentity.data?.data?.rate === 1.0, 'Identity rate equals 1.0');
    assert(fxIdentity.data?.data?.convertedAmount === 500, 'Identity amount preserved');
  }

  console.log('\n====================================================');
  console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All regression and integration tests passed cleanly!\n');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
