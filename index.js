const C={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'};
const J=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{...C,'Content-Type':'application/json'}});
const json=async r=>await r.json().catch(()=>({}));
const sha=async s=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
async function auth(r,e){const h=r.headers.get('Authorization')||'';const t=h.startsWith('Bearer ')?h.slice(7):'';if(!t)return false;const x=await e.DB.prepare('SELECT token FROM sessions WHERE token=? AND expires_at>?').bind(t,Date.now()).first();return !!x}
async function admin(r,e){if(await auth(r,e))return null;return J({error:'غير مصرح — سجل دخول الأدمن أولاً'},401)}
export default{async fetch(r,e){
 if(r.method==='OPTIONS')return new Response('',{headers:C});
 const u=new URL(r.url),p=u.pathname;
 try{
  if(p==='/api/health')return J({ok:true,version:'15',database:'D1',full_control:true});
  if(p==='/api/admin/login'&&r.method==='POST'){
   const b=await json(r),email=String(b.email||'').trim(),password=String(b.password||'');
   if(!e.ADMIN_EMAIL||!e.ADMIN_PASSWORD)return J({error:'لم يتم ضبط ADMIN_EMAIL و ADMIN_PASSWORD في Cloudflare Secrets'},503);
   const ok=email===e.ADMIN_EMAIL && password===e.ADMIN_PASSWORD;
   if(!ok)return J({error:'بيانات الدخول غير صحيحة'},401);
   const token=crypto.randomUUID();await e.DB.prepare('INSERT INTO sessions(token,admin_email,expires_at) VALUES(?,?,?)').bind(token,email,Date.now()+7*86400000).run();
   return J({ok:true,token,admin:{email}});
  }
  if(p==='/api/admin/logout'&&r.method==='POST'){const h=r.headers.get('Authorization')||'';const t=h.startsWith('Bearer ')?h.slice(7):'';if(t)await e.DB.prepare('DELETE FROM sessions WHERE token=?').bind(t).run();return J({ok:true})}
  if(p==='/api/dashboard'){const q=async t=>(await e.DB.prepare(`SELECT COUNT(*) n FROM ${t}`).first()).n;return J({patients:await q('patients'),appointments:await q('appointments'),doctors:await q('doctors'),services:await q('services')})}
  if(p==='/api/services'&&r.method==='GET')return J((await e.DB.prepare('SELECT * FROM services WHERE active=1 ORDER BY id DESC').all()).results);
  if(p==='/api/doctors'&&r.method==='GET')return J((await e.DB.prepare('SELECT * FROM doctors WHERE active=1 ORDER BY id DESC').all()).results);
  if(p==='/api/settings'&&r.method==='GET')return J((await e.DB.prepare('SELECT * FROM settings').all()).results);
  if(p==='/api/appointments'&&r.method==='POST'){
   const b=await json(r);if(!b.name||!b.phone||!b.appointment_date)return J({error:'الاسم والهاتف والموعد مطلوبة'},400);
   let patient=await e.DB.prepare('SELECT id FROM patients WHERE phone=?').bind(b.phone).first();
   if(!patient){const z=await e.DB.prepare('INSERT INTO patients(name,phone,email,notes) VALUES(?,?,?,?)').bind(b.name,b.phone,b.email||'',b.patient_notes||'').run();patient={id:z.meta.last_row_id}}
   await e.DB.prepare('INSERT INTO appointments(patient_id,doctor_id,service_id,appointment_date,notes,status) VALUES(?,?,?,?,?,?)').bind(patient.id,b.doctor_id||null,b.service_id||null,b.appointment_date,b.notes||'','pending').run();
   return J({ok:true},201);
  }
  const protect=['/api/dashboard','/api/patients','/api/doctors','/api/services','/api/appointments','/api/settings'];
  if(protect.some(x=>p===x)){const z=await admin(r,e);if(z)return z}
  if(p==='/api/patients'){if(r.method==='GET')return J((await e.DB.prepare('SELECT * FROM patients ORDER BY id DESC').all()).results);const b=await json(r);if(r.method==='POST'){await e.DB.prepare('INSERT INTO patients(name,phone,email,notes) VALUES(?,?,?,?)').bind(b.name,b.phone,b.email||'',b.notes||'').run();return J({ok:true},201)}if(r.method==='PUT'){await e.DB.prepare('UPDATE patients SET name=?,phone=?,email=?,notes=? WHERE id=?').bind(b.name,b.phone,b.email||'',b.notes||'',b.id).run();return J({ok:true})}if(r.method==='DELETE'){await e.DB.prepare('DELETE FROM patients WHERE id=?').bind(b.id).run();return J({ok:true})}}
  if(p==='/api/doctors'){if(r.method==='GET')return J((await e.DB.prepare('SELECT * FROM doctors ORDER BY id DESC').all()).results);const b=await json(r);if(r.method==='POST'){await e.DB.prepare('INSERT INTO doctors(name,specialty,phone,active) VALUES(?,?,?,?)').bind(b.name,b.specialty||'',b.phone||'',b.active??1).run();return J({ok:true},201)}if(r.method==='PUT'){await e.DB.prepare('UPDATE doctors SET name=?,specialty=?,phone=?,active=? WHERE id=?').bind(b.name,b.specialty||'',b.phone||'',b.active??1,b.id).run();return J({ok:true})}if(r.method==='DELETE'){await e.DB.prepare('DELETE FROM doctors WHERE id=?').bind(b.id).run();return J({ok:true})}}
  if(p==='/api/services'){if(r.method==='GET')return J((await e.DB.prepare('SELECT * FROM services ORDER BY id DESC').all()).results);const b=await json(r);if(r.method==='POST'){await e.DB.prepare('INSERT INTO services(name,description,price,active) VALUES(?,?,?,?)').bind(b.name,b.description||'',Number(b.price)||0,b.active??1).run();return J({ok:true},201)}if(r.method==='PUT'){await e.DB.prepare('UPDATE services SET name=?,description=?,price=?,active=? WHERE id=?').bind(b.name,b.description||'',Number(b.price)||0,b.active??1,b.id).run();return J({ok:true})}if(r.method==='DELETE'){await e.DB.prepare('DELETE FROM services WHERE id=?').bind(b.id).run();return J({ok:true})}}
  if(p==='/api/appointments'){if(r.method==='GET')return J((await e.DB.prepare(`SELECT a.*,p.name patient,p.phone,s.name service,d.name doctor FROM appointments a JOIN patients p ON p.id=a.patient_id LEFT JOIN services s ON s.id=a.service_id LEFT JOIN doctors d ON d.id=a.doctor_id ORDER BY a.appointment_date DESC`).all()).results);const b=await json(r);if(r.method==='POST'){await e.DB.prepare('INSERT INTO appointments(patient_id,doctor_id,service_id,appointment_date,notes,status) VALUES(?,?,?,?,?,?)').bind(b.patient_id,b.doctor_id||null,b.service_id||null,b.appointment_date,b.notes||'',b.status||'pending').run();return J({ok:true},201)}if(r.method==='PUT'){await e.DB.prepare('UPDATE appointments SET patient_id=?,doctor_id=?,service_id=?,appointment_date=?,notes=?,status=? WHERE id=?').bind(b.patient_id,b.doctor_id||null,b.service_id||null,b.appointment_date,b.notes||'',b.status||'pending',b.id).run();return J({ok:true})}if(r.method==='DELETE'){await e.DB.prepare('DELETE FROM appointments WHERE id=?').bind(b.id).run();return J({ok:true})}}
  if(p==='/api/settings'){if(r.method==='GET')return J((await e.DB.prepare('SELECT * FROM settings').all()).results);const b=await json(r);await e.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(b.key,b.value||'').run();return J({ok:true})}
  return J({error:'Not found'},404);
 }catch(x){return J({error:x.message},500)}
}};
