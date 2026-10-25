/**
 * Southbank District — original, deliberately compressed London-inspired arena.
 * All geometry and canvas textures are authored for WARFRONT. The ten gameplay
 * volumes are supplied by the shared authoritative simulation, never recreated.
 * Static geometry is merged per material; decorative props stay within those
 * volumes or outside the 31m playable boundary. See docs/CITY_REFERENCE.md.
 */
export function buildCity(app, pc, boxes) {
  const root = new pc.Entity('Southbank District');
  app.root.addChild(root);
  const batches = new Map();
  let seed = 817391;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const canvasTexture = (name, size, draw) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    draw(canvas.getContext('2d'), size);
    const t = new pc.Texture(app.graphicsDevice, {name, width:size, height:size, mipmaps:true,
      minFilter:pc.FILTER_LINEAR_MIPMAP_LINEAR, magFilter:pc.FILTER_LINEAR,
      addressU:pc.ADDRESS_REPEAT, addressV:pc.ADDRESS_REPEAT, anisotropy:4});
    t.setSource(canvas); return t;
  };
  const material = (name, color, opts={}) => {
    const m = new pc.StandardMaterial(); m.name = name;
    m.diffuse = new pc.Color(...color); m.useMetalness = true;
    m.metalness = opts.metal || 0; m.gloss = opts.gloss ?? .17;
    if(opts.map) m.diffuseMap = opts.map;
    if(opts.emissive) m.emissive = new pc.Color(...opts.emissive);
    m.update(); return m;
  };
  const brickTexture = (name, base) => canvasTexture(name,512,(ctx,s) => {
    ctx.fillStyle = '#716a5d'; ctx.fillRect(0,0,s,s);
    for(let row=0;row<16;row++) for(let col=-1;col<8;col++) {
      const n=(random()-.5)*32, x=col*72+(row%2)*36;
      ctx.fillStyle=`rgb(${base[0]+n},${base[1]+n},${base[2]+n})`;
      ctx.fillRect(x+2,row*32+2,68,28);
      ctx.fillStyle='rgba(255,240,208,.09)'; ctx.fillRect(x+3,row*32+3,66,2);
      ctx.fillStyle='rgba(12,20,24,.15)'; ctx.fillRect(x+3,row*32+27,66,2);
    }
    for(let i=0;i<18000;i++) {
      ctx.fillStyle=random()>.5?'rgba(28,19,13,.1)':'rgba(255,236,200,.09)';
      ctx.fillRect(random()*s,random()*s,random()*2+1,random()*2+1);
    }
    for(let i=0;i<12;i++) {const x=random()*s;const g=ctx.createLinearGradient(x,0,x+18,0);g.addColorStop(0,'transparent');g.addColorStop(.5,'#161f1b17');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x,0,18,s);}
  });
  const asphalt = canvasTexture('Worn asphalt',512,(ctx,s)=>{
    ctx.fillStyle='#434b4d';ctx.fillRect(0,0,s,s);
    for(let i=0;i<30000;i++){const l=35+random()*68;ctx.fillStyle=`rgba(${l},${l+3},${l+5},.42)`;ctx.fillRect(random()*s,random()*s,1.8,1.8);}
    for(let i=0;i<4;i++){let x=random()*s,y=random()*s;ctx.strokeStyle='#1d272a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);for(let j=0;j<7;j++){x+=random()*25-12;y+=random()*35;ctx.lineTo(x,y);}ctx.stroke();}
  });
  const paving = canvasTexture('Portland paving',512,(ctx,s)=>{
    ctx.fillStyle='#a7a795';ctx.fillRect(0,0,s,s);
    for(let r=0;r<8;r++)for(let c=0;c<4;c++){const v=Math.floor(random()*16);ctx.fillStyle=`rgb(${155+v},${159+v},${149+v})`;ctx.fillRect(c*128+2,r*64+2,124,60);}
    for(let i=0;i<9000;i++){ctx.fillStyle=random()>.5?'#ffffff0c':'#121a200c';ctx.fillRect(random()*s,random()*s,2,2);}
  });
  const concreteMap = canvasTexture('Weathered limestone',256,(ctx,s)=>{
    ctx.fillStyle='#c0baa6';ctx.fillRect(0,0,s,s);for(let i=0;i<16000;i++){ctx.fillStyle=random()>.5?'#fff9dc11':'#151f2910';ctx.fillRect(random()*s,random()*s,random()*3,random()*3);}
  });
  const glassTexture = canvasTexture('Sash glass reflections',256,(ctx,s)=>{
    const g=ctx.createLinearGradient(0,0,s,s);g.addColorStop(0,'#749399');g.addColorStop(.48,'#344e56');g.addColorStop(.51,'#91a0a2');g.addColorStop(.56,'#394c52');g.addColorStop(1,'#152832');ctx.fillStyle=g;ctx.fillRect(0,0,s,s);
    ctx.fillStyle='#101b2470';ctx.fillRect(0,s*.48,s,s*.08);ctx.fillRect(s*.48,0,s*.04,s);
    ctx.fillStyle='#d8d6b214';ctx.fillRect(16,0,40,s);
  });
  const M = {
    brick:material('London stock brick',[.87,.88,.85],{map:brickTexture('London yellow stock brick',[137,123,94])}),
    redBrick:material('Iron red brick',[.88,.84,.8],{map:brickTexture('Red brick',[126,73,51])}),
    stone:material('Portland stone',[.92,.91,.85],{map:concreteMap}),
    asphalt:material('Asphalt',[.8,.84,.86],{map:asphalt}),
    pavement:material('Paving',[.91,.91,.87],{map:paving}),
    dark:material('Painted charcoal metal',[.105,.145,.16],{metal:.2,gloss:.34}),
    frame:material('Ivory painted timber',[.73,.74,.67]),
    glass:material('Blue grey window glass',[.78,.88,.92],{map:glassTexture,metal:.35,gloss:.65}),
    warmGlass:material('Occupied windows',[.26,.22,.14],{emissive:[.19,.13,.045],gloss:.3}),
    gold:material('Road markings',[.78,.62,.27]),
    white:material('Faded white paint',[.73,.77,.72]),
    red:material('Oxide red enamel',[.56,.065,.043],{metal:.25,gloss:.43}),
    navy:material('Petrol blue painted panels',[.064,.19,.23],{gloss:.36}),
    green:material('Deep green pub timber',[.075,.18,.135],{gloss:.3}),
    metal:material('Galvanised steel',[.38,.43,.43],{metal:.64,gloss:.38}),
    rubber:material('Rubber',[.027,.035,.038],{gloss:.08}),
    orange:material('Hazard amber',[.89,.36,.055]),
    lamp:material('Warm lamp glass',[.85,.77,.5],{emissive:[1,.66,.24]}),
    water:material('Thames blue green',[.155,.31,.32],{metal:.42,gloss:.77}),
    leaf:material('Plane tree leaves',[.19,.26,.17]),
    trunk:material('Tree trunk',[.32,.29,.22]),
    skyGlass:material('Skyline glass',[.3,.46,.5],{metal:.35,gloss:.59}),
    skyline:material('Distant stone',[.39,.44,.43]),
    dirt:material('Roof gravel',[.22,.24,.22])
  };
  const data = mat => {if(!batches.has(mat))batches.set(mat,{p:[],n:[],u:[],i:[]});return batches.get(mat);};
  function quad(mat, vertices, normal, uv=[0,0,1,0,1,1,0,1]) {
    const b=data(mat), idx=b.p.length/3;b.p.push(...vertices.flat());b.n.push(...normal,...normal,...normal,...normal);b.u.push(...uv);b.i.push(idx,idx+1,idx+2,idx,idx+2,idx+3);
  }
  function block(name,pos,size,mat,yaw=0,tile=0) {
    const [x,y,z]=pos,[w,h,d]=size,a=yaw*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
    const p=(xx,yy,zz)=>[x+xx*c+zz*s,y+yy,z-xx*s+zz*c];
    const n=(xx,yy,zz)=>[xx*c+zz*s,yy,-xx*s+zz*c];
    const uv=(ww,hh)=>[0,0,tile?ww/tile:1,0,tile?ww/tile:1,tile?hh/tile:1,0,tile?hh/tile:1];
    quad(mat,[p(-w/2,-h/2,d/2),p(w/2,-h/2,d/2),p(w/2,h/2,d/2),p(-w/2,h/2,d/2)],n(0,0,1),uv(w,h));
    quad(mat,[p(w/2,-h/2,-d/2),p(-w/2,-h/2,-d/2),p(-w/2,h/2,-d/2),p(w/2,h/2,-d/2)],n(0,0,-1),uv(w,h));
    quad(mat,[p(w/2,-h/2,d/2),p(w/2,-h/2,-d/2),p(w/2,h/2,-d/2),p(w/2,h/2,d/2)],n(1,0,0),uv(d,h));
    quad(mat,[p(-w/2,-h/2,-d/2),p(-w/2,-h/2,d/2),p(-w/2,h/2,d/2),p(-w/2,h/2,-d/2)],n(-1,0,0),uv(d,h));
    quad(mat,[p(-w/2,h/2,d/2),p(w/2,h/2,d/2),p(w/2,h/2,-d/2),p(-w/2,h/2,-d/2)],n(0,1,0),uv(w,d));
    quad(mat,[p(-w/2,-h/2,-d/2),p(w/2,-h/2,-d/2),p(w/2,-h/2,d/2),p(-w/2,-h/2,d/2)],n(0,-1,0),uv(w,d));
  }
  function beam(from,to,radius,mat,sides=6) {
    const dir=new pc.Vec3(...to).sub(new pc.Vec3(...from)),len=dir.length();dir.normalize();
    const side=new pc.Vec3().cross(dir,Math.abs(dir.y)>.9?pc.Vec3.RIGHT:pc.Vec3.UP).normalize();
    const up=new pc.Vec3().cross(side,dir).normalize();
    for(let i=0;i<sides;i++){
      const a=i/sides*Math.PI*2,b=(i+1)/sides*Math.PI*2;
      const offsets=[a,b].map(t=>side.clone().mulScalar(Math.cos(t)*radius).add(up.clone().mulScalar(Math.sin(t)*radius)));
      const p=(v,k)=>[from[0]+dir.x*k+v.x,from[1]+dir.y*k+v.y,from[2]+dir.z*k+v.z];
      const normal=offsets[0].clone().add(offsets[1]).normalize();
      quad(mat,[p(offsets[1],0),p(offsets[0],0),p(offsets[0],len),p(offsets[1],len)],[normal.x,normal.y,normal.z]);
    }
  }
  const signCache = new Map();
  const signMaterial=(text,bg='#183a3a',fg='#ded8bf',subtitle='')=>{
    const key=[text,bg,fg,subtitle].join('|');if(signCache.has(key))return signCache.get(key);
    const m=material(text,[1,1,1],{map:canvasTexture(text,512,(ctx,s)=>{
    ctx.fillStyle=bg;ctx.fillRect(0,0,s,s);ctx.strokeStyle=fg;ctx.lineWidth=3;ctx.strokeRect(14,110,s-28,292);
    ctx.fillStyle=fg;ctx.font=`bold ${Math.min(70,590/text.length)}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,s/2,subtitle?235:256,s-48);
    if(subtitle){ctx.font='21px sans-serif';ctx.fillText(subtitle,s/2,307,s-48);}
  })});signCache.set(key,m);return m;};
  const sign=(text,pos,width,height,yaw=0,bg,fg,sub)=>block(text,pos,[width,height,.045],signMaterial(text,bg,fg,sub),yaw);
  const stamp=(text,x,z,w,d,yaw=0)=>{
    const mat=material(text,[1,1,1],{map:canvasTexture(text,256,(ctx,s)=>{ctx.fillStyle='#40484a';ctx.fillRect(0,0,s,s);ctx.fillStyle='#c7c8b3';ctx.font='bold 54px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,s/2,s/2,s*.9);})});
    block(text,[x,.023,z],[w,.006,d],mat,yaw);
  };
  // Flush surfaces keep exactly the same walkable height as the simulation.
  block('district ground',[0,-.18,0],[200,.35,200],M.pavement,0,4);
  block('Borough Way',[0,.002,0],[19,.008,98],M.asphalt,0,6);
  block('Clink Lane',[0,.007,16],[98,.008,9],M.asphalt,0,6);
  block('Mill Street',[0,.004,-25],[98,.008,8],M.asphalt,0,6);
  for(const x of [-9.05,9.05])for(const off of [0,.19])block('double yellow',[x+off,.019,-1],[.075,.006,45],M.gold);
  for(let z=-31;z<35;z+=5)if(Math.abs(z-16)>5&&Math.abs(z+25)>4)block('centre dash',[0,.019,z],[.13,.005,2.2],M.white);
  for(let x=-30;x<32;x+=5)if(Math.abs(x)>10)block('cross street dash',[x,.024,16],[2,.004,.13],M.white);
  for(let x=-8;x<=8;x+=1.7)block('zebra crossing',[x,.025,21.2],[1.15,.006,2.9],M.white);
  // Left-side traffic: approaching the northern end, northbound vehicles keep west.
  stamp('LOOK RIGHT',-4.5,23.4,4,1.1,0);stamp('LOOK LEFT',4.5,19,4,1.1,180);
  stamp('SLOW',-4.5,-12,3.5,2,0);stamp('SLOW',4.5,28,3.5,2,180);
  for(const z of [-27.8,-21.1,11.5,20.4])block('cross street kerb',[0,.024,z],[65,.036,.2],M.stone);
  for(const x of [-9.7,9.7])block('Borough Way kerb',[x,.024,0],[.22,.036,65],M.stone);

  function windowAt(x,y,z,width,height,yaw,warm=false){
    block('window surround',[x,y,z],[width+.21,height+.19,.06],M.stone,yaw);
    const a=yaw*Math.PI/180,n=[Math.sin(a),Math.cos(a)];
    const q=(dx,dy,dz)=>[x+dx*Math.cos(a)+dz*n[0],y+dy,z-dx*Math.sin(a)+dz*n[1]];
    block('window panes',q(0,0,.045),[width,height,.035],warm?M.warmGlass:M.glass,yaw);
    block('sash centre',q(0,0,.071),[width,.055,.045],M.frame,yaw);
    block('sash mullion',q(0,0,.071),[.045,height,.045],M.frame,yaw);
    block('projecting sill',q(0,-height/2-.07,.04),[width+.3,.105,.19],M.stone,yaw);
    block('stone lintel',q(0,height/2+.09,0),[width+.3,.14,.13],M.stone,yaw);
  }
  function frontage(x,z,w,yaw,label,color){
    const a=yaw*Math.PI/180, q=(xx,yy,zz)=>[x+xx*Math.cos(a)+zz*Math.sin(a),yy,z-xx*Math.sin(a)+zz*Math.cos(a)];
    block('painted shop timber',q(0,1.22,0),[w,2.44,.075],color,yaw);
    block('shop glazing',q(-w*.13,1.29,.05),[w*.68,1.7,.035],M.glass,yaw);
    block('shop door',q(w*.34,1.11,.055),[w*.2,2.16,.045],M.dark,yaw);
    block('door glass',q(w*.34,1.43,.084),[w*.13,1.12,.02],M.glass,yaw);
    block('shop middle mullion',q(-w*.15,1.27,.084),[.075,1.8,.04],color,yaw);
    block('shop stall riser',q(-w*.13,.3,.08),[w*.7,.47,.06],color,yaw);
    sign(label,q(0,2.55,.09),w+.14,.5,yaw,color===M.green?'#183b2b':'#183b49','#ddd5ba','SOUTHBANK · LONDON');
    block('shop cornice',q(0,2.86,.03),[w+.25,.12,.24],M.stone,yaw);
  }
  const names=['THE COPPER HOUND','RIVER & RYE','BOROUGH BOOKS','MILL STREET STORE'];
  boxes.forEach(([x,y,z,w,h,d],index)=>{
    if(h>3){
      const brick=index%2?M.redBrick:M.brick;
      block('authoritative building',[x,y,z],[w,h,d],brick,0,3.8);
      block('damp proof stone base',[x,.22,z],[w+.025,.44,d+.025],M.stone,0,3);
      block('roof slab',[x,h-.08,z],[w,.15,d],M.dark);
      for(const edge of [-1,1]){
        block('parapet front',[x,h-.04,z+edge*(d/2-.11)],[w,.34,.22],M.stone);
        block('parapet side',[x+edge*(w/2-.11),h-.04,z],[.22,.34,d],M.stone);
        for(let yy=3.9;yy<h-1;yy+=2.3){
          for(let zz=z-d/2+1.5;zz<z+d/2-.9;zz+=2.6)windowAt(x+edge*(w/2+.012),yy,zz,1.05,1.55,edge*90,(index+Math.round(zz))%5===0);
          for(let xx=x-w/2+1.3;xx<x+w/2-.8;xx+=2.4)windowAt(xx,yy,z+edge*(d/2+.012),1,1.55,edge===1?0:180,(index+Math.round(xx))%7===0);
        }
        block('string course',[x,2.98,z+edge*(d/2+.02)],[w,.13,.13],M.stone);
        block('string course',[x+edge*(w/2+.02),2.98,z],[.13,.13,d],M.stone);
        // Timber ground floors occupy the building surface; no invisible new obstacles.
        for(let zz=z-d/2+2;zz<z+d/2-1;zz+=4)frontage(x+edge*(w/2+.05),zz,3.4,edge*90,names[(index+Math.floor(zz+40))%names.length],index%2?M.green:M.navy);
      }
      for(let xx=x-w/2+1.3;xx<x+w/2-1;xx+=3.6)frontage(xx,z+d/2+.045,2.9,0,names[index%names.length],M.green);
      // Roof objects remain inside the horizontal authoritative footprint.
      block('chimney stack',[x-w*.25,h+.42,z+d*.3],[.65,.9,.6],brick,0,2);
      for(const dx of [-.17,.17])beam([x-w*.25+dx,h+.87,z+d*.3],[x-w*.25+dx,h+1.18,z+d*.3],.11,M.redBrick,8);
      block('roof plant',[x+w*.23,h+.28,z-d*.22],[1.3,.55,1.1],M.metal);
      for(let j=0;j<6;j++)block('vent grille',[x+w*.23-.5+j*.2,h+.58,z-d*.22],[.04,.035,.83],M.dark);
      if(index===0)sign('CLINK LANE · SE1',[x+w/2+.09,2.8,z-d/2+1.4],2,.35,90,'#e4e0cc','#263f42');
    }else{
      // Each cover piece fills its complete original box, keeping visual hit
      // boundaries aligned with server hitscan and movement.
      const panel=index%2?M.navy:M.green;
      block('authoritative freight cover',[x,y,z],[w,h,d],panel);
      block('freight base',[x,.12,z],[w,.24,d],M.dark);
      block('freight top',[x,h-.08,z],[w,.16,d],M.metal);
      for(let xx=x-w/2+.18;xx<x+w/2;xx+=.45)for(const zz of [-1,1])block('container fluting',[xx,y,z+zz*(d/2+.025)],[.065,h-.12,.05],M.metal);
      for(const xx of [-1,1]){block('reinforced corner',[x+xx*(w/2-.06),y,z],[.12,h,d+.025],M.dark);block('hazard band',[x+xx*w*.28,h*.55,z+d/2+.06],[.35,.7,.025],M.gold,-20);}
      sign('SOUTH DOCK',[x,h*.58,z+d/2+.08],Math.min(2.4,w*.67),.58,0,'#203d42','#d7d4b7');
      block('cover scuff',[x-w*.2,h*.27,z+d/2+.065],[w*.18,.08,.02],M.stone);
    }
  });

  // An intact urban horizon makes the arena a city, rather than a walled box.
  function distantBuilding(x,z,w,h,d,index){
    block('background town block',[x,h/2,z],[w,h,d],index%3===0?M.redBrick:M.brick,0,4);
    block('background cornice',[x,h-.1,z],[w+.2,.28,d+.2],M.stone);
    for(let yy=3.8;yy<h-1;yy+=2.65){
      for(let xx=x-w/2+1.4;xx<x+w/2-1;xx+=2.6)for(const side of [-1,1])windowAt(xx,yy,z+side*(d/2+.02),1.05,1.55,side===1?0:180,(Math.round(xx+yy)+index)%9===0);
      for(let zz=z-d/2+1.6;zz<z+d/2-1;zz+=3.1)for(const side of [-1,1])windowAt(x+side*(w/2+.02),yy,zz,1.05,1.55,side*90,false);
    }
    block('roof chimney',[x+w*.2,h+.6,z],[.8,1.2,.7],M.redBrick,0,3);
    if(index<8)frontage(x,z-d/2-.06,Math.min(w-1,7),180,names[index%4],M.navy);
  }
  for(let i=0;i<7;i++){
    distantBuilding(-42,-34+i*13,12,10+(i%3)*2.7,10,i);
    distantBuilding(43,-36+i*14,14,12+(i%4)*2.2,10,i+7);
  }
  for(let i=0;i<6;i++)distantBuilding(-30+i*13,43,11,11+(i%3)*3.5,11,i+2);
  // Continuous but low street-edge works show where the operational cordon ends.
  for(let x=-30;x<=30;x+=4){block('cordon barrier',[x,.65,32.8],[3.2,1.3,.6],M.stone);block('barrier red stripe',[x,.75,32.48],[2.2,.18,.02],M.red);}
  for(let z=-28;z<=29;z+=4.5)for(const x of [-32.6,32.6]){
    beam([x,0,z],[x,1.02,z],.07,M.dark);beam([x,0,z+3.6],[x,1.02,z+3.6],.07,M.dark);
    beam([x,.75,z],[x,.75,z+3.6],.045,M.dark);
  }
  sign('SOUTHBANK',[0,3.1,33.1],6,.9,180,'#183d3d','#e2dac3','DISTRICT · LONDON SE1');
  beam([-4.2,0,33.1],[-4.2,4,33.1],.09,M.dark);beam([4.2,0,33.1],[4.2,4,33.1],.09,M.dark);

  function lamp(x,z){
    beam([x,0,z],[x,4.8,z],.065,M.dark,8);block('lamp base',[x,.22,z],[.28,.44,.28],M.dark);
    beam([x,4.7,z],[x+.8,4.9,z],.045,M.dark);block('lamp shade',[x+.8,4.86,z],[.7,.12,.35],M.dark);
    block('lamp diffuser',[x+.8,4.78,z],[.55,.04,.25],M.lamp);
  }
  for(let z=-27;z<32;z+=14)for(const x of [-34,34])lamp(x,z);
  // Facade-mounted street lamps stay inside collision boxes.
  for(const x of [-14,14])lamp(x,x<0?7:-8);
  function phoneBox(x,z,yaw){
    const a=yaw*Math.PI/180,q=(xx,yy,zz)=>[x+xx*Math.cos(a)+zz*Math.sin(a),yy,z-xx*Math.sin(a)+zz*Math.cos(a)];
    block('red telephone kiosk',q(0,1.17,0),[1,2.34,.95],M.red,yaw);
    for(const side of [-1,1]){
      block('kiosk side glass',q(side*.51,1.16,0),[.02,1.72,.7],M.glass,yaw);
      for(let j=0;j<5;j++)block('kiosk side bars',q(side*.525,.44+j*.35,0),[.03,.045,.76],M.red,yaw);
    }
    block('kiosk door glass',q(0,1.16,-.488),[.74,1.72,.025],M.glass,yaw);
    for(let j=0;j<5;j++)block('kiosk bars',q(0,.44+j*.35,-.513),[.79,.045,.035],M.red,yaw);
    for(const xx of [-.25,0,.25])block('kiosk bars',q(xx,1.15,-.513),[.035,1.75,.035],M.red,yaw);
    block('kiosk roof',q(0,2.42,0),[1.12,.18,1.06],M.red,yaw);
    sign('TELEPHONE',q(0,2.18,-.53),.85,.2,180+yaw,'#e5d8bb','#5f2820');
  }
  phoneBox(-34,12,90);phoneBox(34,-13,-90);
  function vehicle(x,z,kind,yaw=0){
    const bus=kind==='bus',a=yaw*Math.PI/180,q=(xx,yy,zz)=>[x+xx*Math.cos(a)+zz*Math.sin(a),yy,z-xx*Math.sin(a)+zz*Math.cos(a)],paint=bus?M.red:M.dark;
    const width=bus?2.45:1.9,length=bus?9:4.5;
    block('vehicle chassis',q(0,.65,0),[width,.8,length],paint,yaw);
    block('vehicle cabin',q(0,bus?2.4:1.28,bus?0:-.2),[width-.1,bus?2.8:.9,bus?length-.15:2.65],paint,yaw);
    for(const side of [-1,1]){
      for(let zz=-length*.3;zz<length*.4;zz+=bus?1.3:1.2){
        block('side windows',q(side*(width/2+.01),bus?2.95:1.5,zz),[.03,bus?.9:.5,bus?1.08:.97],M.glass,yaw);
        if(bus)block('lower bus windows',q(side*(width/2+.01),1.55,zz),[.03,.9,1.08],M.glass,yaw);
      }
      for(const zz of [-length*.31,length*.31]){
        const p1=q(side*(width/2-.06),.48,zz),p2=q(side*(width/2+.1),.48,zz);
        beam(p1,p2,bus?.5:.38,M.rubber,12);beam(q(side*(width/2+.11),.48,zz),q(side*(width/2+.13),.48,zz),bus?.25:.18,M.metal,8);
      }
    }
    block('windscreen',q(0,bus?2.95:1.5,-length/2-.02),[width-.3,bus?.8:.45,.03],M.glass,yaw);
    if(bus){block('bus lower windscreen',q(0,1.55,-length/2-.03),[width-.3,.8,.03],M.glass,yaw);sign('68 · SOUTH BANK',q(0,2.25,-length/2-.07),2,.28,180+yaw,'#17201c','#d8ad53');}
    else {block('taxi hood',q(0,.94,-1.6),[width,.25,1.3],M.dark,yaw);sign('TAXI',q(0,1.83,-.37),.53,.19,180+yaw,'#e2b94f','#262923');}
    for(const xx of [-width*.34,width*.34]){block('headlights',q(xx,.74,-length/2-.05),[.28,.2,.04],M.lamp,yaw);block('tail lights',q(xx,.85,length/2+.04),[.18,.19,.04],M.red,yaw);}
  }
  vehicle(-35,-3,'bus',180);vehicle(35,23,'taxi',0);
  sign('BUS STOP',[-33.8,3,-8.5],.7,.6,90,'#e2dac0','#8e2820');beam([-33.8,0,-8.5],[-33.8,3.4,-8.5],.045,M.metal);
  for(const pos of [[-35,27],[35,-26],[-36,-27],[36,8]]){
    const [x,z]=pos;beam([x,0,z],[x,5.8,z],.19,M.trunk,7);
    for(let k=0;k<4;k++){const a=k*Math.PI/2;beam([x,3.8,z],[x+Math.cos(a)*1.7,6.3,z+Math.sin(a)*1.7],.09,M.trunk);block('plane tree crown',[x+Math.cos(a)*1.2,6.4,z+Math.sin(a)*1.2],[2.6,2.5,2.5],M.leaf,k*31);}
  }

  // Thames bank and an original compact bridge, entirely beyond the arena.
  block('river surface',[0,-.62,-55],[160,.1,34],M.water);
  block('south embankment',[0,-.2,-36],[160,1.2,1.4],M.stone,0,4);
  block('north embankment',[0,-.2,-74],[160,1.2,1.4],M.stone,0,4);
  for(let x=-70;x<75;x+=4){beam([x,.3,-36],[x,1.2,-36],.065,M.dark);beam([x,1.1,-36],[x+4,1.1,-36],.055,M.dark);}
  block('bridge deck',[17,.7,-55],[7,.55,38],M.stone,0,4);
  block('bridge carriageway',[17,.99,-55],[5,.04,38],M.asphalt,0,5);
  for(const x of [13.7,20.3]){block('bridge parapet',[x,1.37,-55],[.45,.8,38],M.stone);for(let z=-72;z<-36;z+=6)block('bridge pier',[x,-.7,z],[1.5,3,2.5],M.stone);}
  for(let i=0;i<28;i++){const x=-70+i*5;block('river sheen',[x,-.558,-50+random()*17],[2+random()*2,.006,.07],M.skyGlass);}
  // Original wheel silhouette evokes London's riverside without imported models.
  const wheelX=-47,wheelY=19,wheelZ=-60,radius=16;
  for(let i=0;i<64;i++){
    const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2;
    beam([wheelX+Math.cos(a)*radius,wheelY+Math.sin(a)*radius,wheelZ],[wheelX+Math.cos(b)*radius,wheelY+Math.sin(b)*radius,wheelZ],.14,M.frame,5);
    if(i%4===0){const x=wheelX+Math.cos(a)*radius,y=wheelY+Math.sin(a)*radius;beam([wheelX,wheelY,wheelZ],[x,y,wheelZ],.035,M.metal,4);block('observation capsule',[x,y,wheelZ],[1.3,.85,.95],M.glass);}
  }
  beam([wheelX-6,0,wheelZ+3],[wheelX,wheelY,wheelZ],.45,M.frame,8);
  beam([wheelX+6,0,wheelZ+3],[wheelX,wheelY,wheelZ],.45,M.frame,8);
  beam([wheelX,wheelY,wheelZ-1],[wheelX,wheelY,wheelZ+1],.55,M.metal,8);
  // Glass spire and clock tower are original low-poly skyline compositions.
  const spire=(x,z,height,width,base=0)=>{
    for(let side=0;side<4;side++){
      const a=side*Math.PI/2,b=(side+1)*Math.PI/2,p2=[x+Math.cos(a)*width,base,z+Math.sin(a)*width],p1=[x+Math.cos(b)*width,base,z+Math.sin(b)*width],top=[x+width*.08,height,z-width*.1];
      const normal=new pc.Vec3().cross(new pc.Vec3(...p2).sub(new pc.Vec3(...p1)),new pc.Vec3(...top).sub(new pc.Vec3(...p1))).normalize();
      const batch=data(M.skyGlass),idx=batch.p.length/3;batch.p.push(...p1,...p2,...top);for(let j=0;j<3;j++)batch.n.push(normal.x,normal.y,normal.z);batch.u.push(0,0,1,0,.5,1);batch.i.push(idx,idx+1,idx+2);
      beam(p1,top,.09,M.frame,4);
    }
  };
  spire(49,-91,65,7);spire(61,-97,36,5);
  block('clock tower',[65,14,-63],[5.4,28,5.4],M.stone,0,4);block('clock tower belfry',[65,29,-63],[6.5,4,6.5],M.stone);
  for(const side of [-1,1]){sign('XII',[65,29,-63+side*3.28],3.8,3.8,side===1?0:180,'#d7ceb4','#313e3d');beam([65,27.5,-63+side*3.32],[65,30.2,-63+side*3.32],.07,M.dark);beam([65,29,-63+side*3.32],[66,29.6,-63+side*3.32],.07,M.dark);}
  block('tower crown',[65,32,-63],[5,.7,5],M.dark);spire(65,-63,39,3.5,32.4);
  for(let i=0;i<16;i++){const x=-90+i*12,h=10+(i%5)*4;block('city horizon',[x,h/2,-103],[8,h,12],i%2?M.skyGlass:M.skyline);for(let yy=3;yy<h;yy+=2.8)block('horizon floor',[x,yy,-96.98],[7.7,.08,.02],M.frame);}
  // Small damage marks are surface details only, so collision never changes.
  for(let i=0;i<22;i++){const b=boxes[i%boxes.length],x=b[0]+(random()-.5)*(b[3]-.4),y=.3+random()*Math.min(4,b[4]-.5);block('surface chip',[x,y,b[2]+b[5]/2+.04],[.08+random()*.2,.05+random()*.18,.02],M.dark,random()*60);}
  for(const [mat,b] of batches){
    if(!b.i.length)continue;
    const mesh=new pc.Mesh(app.graphicsDevice);mesh.setPositions(b.p);mesh.setNormals(b.n);mesh.setUvs(0,b.u);mesh.setIndices(b.i);mesh.update(pc.PRIMITIVE_TRIANGLES);
    const e=new pc.Entity(mat.name);e.addComponent('render',{meshInstances:[new pc.MeshInstance(mesh,mat,e)],castShadows:mat!==M.water&&mat!==M.lamp,receiveShadows:true});root.addChild(e);
  }
  return {name:'Southbank District',bounds:31,root,update(){},stats:{drawGroups:batches.size,triangles:[...batches.values()].reduce((n,b)=>n+b.i.length/3,0)}};
}
