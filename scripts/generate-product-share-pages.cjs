const fs=require("node:fs"),path=require("node:path"),{execFileSync}=require("node:child_process");
const API="https://yymdyxlbdgbrgrykdspx.supabase.co/rest/v1/products?select=id,name,description,price,currency,image_url,product_image_urls,is_active&is_active=eq.true&order=id.desc";
const KEY="sb_publishable_S13gp2eIUUUiT3AP21YQKw_jt4U_wUn";
const BASE="https://digdow125-ux.github.io/Rianderblog";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function saveLocalImage(p,dir){
 const gal=Array.isArray(p.product_image_urls)?p.product_image_urls:[];
 const source=gal.find(x=>typeof x==="string"&&/^https:\/\//i.test(x))||p.image_url||"";
 if(!/^https:\/\//i.test(source))return "";
 const temp=path.join(dir,"product-source");
 const output=path.join(dir,"product-preview.jpg");
 try{
  const response=await fetch(source,{redirect:"follow"});
  if(!response.ok)throw new Error("Image request returned "+response.status);
  const type=response.headers.get("content-type")||"";
  if(!/^image\/(jpeg|jpg|png|webp|gif|avif)/i.test(type))throw new Error("Unsupported image content type: "+type);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(!bytes.length)throw new Error("Empty product image");
  fs.writeFileSync(temp,bytes);
  execFileSync("convert",[temp+"[0]","-auto-orient","-thumbnail","1080x550>","-background","#ffffff","-gravity","center","-extent","1200x630","-strip","-quality","88",output]);
  fs.unlinkSync(temp);
  for(const old of ["product.jpg","product.png","product.gif","product.webp","product.avif"])try{fs.unlinkSync(path.join(dir,old));}catch{}
  return BASE+"/share/"+encodeURIComponent(String(p.id))+"/product-preview.jpg?v="+encodeURIComponent(String(p.id));
 }catch(error){
  try{fs.unlinkSync(temp);}catch{}
  console.warn("Could not create social thumbnail for product "+p.id+": "+error.message);
  return source;
 }
}
function render(p,img){
 const price=(p.currency||"MWK")+" "+(p.price??"");
 const desc=[String(p.description||"Discover this product on RIANDERBLOG.").replace(/\s+/g," ").slice(0,260),"Price: "+price+"."].join(" ");
 const canonical=BASE+"/share/"+p.id+"/";
 const dest=BASE+"/?product="+encodeURIComponent(p.id);
 const imageTags=img?'<meta property="og:image" content="'+esc(img)+'"><meta property="og:image:secure_url" content="'+esc(img)+'"><meta property="og:image:type" content="image/'+(img.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1]||"jpeg").replace("jpg","jpeg")+'"><meta property="og:image:alt" content="'+esc(p.name)+'"><meta name="twitter:image" content="'+esc(img)+'">':"";
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(p.name)+' | RIANDERBLOG</title><meta name="description" content="'+esc(desc)+'"><link rel="canonical" href="'+canonical+'"><meta property="og:type" content="product"><meta property="og:site_name" content="RIANDERBLOG"><meta property="og:title" content="'+esc(p.name)+' | RIANDERBLOG"><meta property="og:description" content="'+esc(desc)+'"><meta property="og:url" content="'+canonical+'"><meta property="product:price:amount" content="'+esc(p.price)+'"><meta property="product:price:currency" content="'+esc(p.currency||"MWK")+'"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+esc(p.name)+' | RIANDERBLOG"><meta name="twitter:description" content="'+esc(desc)+'">'+imageTags+'<script>window.location.replace('+JSON.stringify(dest)+');</script></head><body><h1>'+esc(p.name)+'</h1><p><strong>'+esc(price)+'</strong></p>'+(img?'<img src="'+esc(img)+'" alt="'+esc(p.name)+'" style="display:block;width:min(100vw,2500px);height:min(140vh,1520px);max-width:100%;object-fit:contain;margin:18px auto;background:#fff;border-radius:12px">':"")+'<p>'+esc(desc)+'</p><p><a href="'+dest+'">View this product on RIANDERBLOG</a></p></body></html>';
}
(async()=>{
 const res=await fetch(API,{headers:{apikey:KEY,Authorization:"Bearer "+KEY}});
 if(!res.ok)throw new Error("Supabase query failed: "+res.status+" "+await res.text());
 const products=await res.json();
 for(const p of products){
  const dir=path.join(process.cwd(),"share",String(p.id));
  fs.mkdirSync(dir,{recursive:true});
  const img=await saveLocalImage(p,dir);
  fs.writeFileSync(path.join(dir,"index.html"),render(p,img));
 }
 console.log("Generated "+products.length+" product preview pages with local image copies.");
})().catch(e=>{console.error(e);process.exit(1);});
