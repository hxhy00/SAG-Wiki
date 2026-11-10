// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {mount,tick,unmount} from 'svelte';
import RuntimeSettings from '../src/components/RuntimeSettings.svelte';
const {api}=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('../src/lib/api',()=>({api}));
let app:ReturnType<typeof mount>;
afterEach(async()=>{if(app)await unmount(app);document.body.innerHTML='';vi.clearAllMocks()});
it('loads backend defaults, edits only current group and resets controls',async()=>{
 api.mockResolvedValue(JSON.stringify({defaults:{docling_timeout_secs:1800,docling_threads:2,jev_concurrency:20},fields:[
 {key:'docling_timeout_secs',label:'Docling 转换时限',unit:'秒',help:'新任务生效',min:10,max:86400,group:'files',advanced:false},
 {key:'docling_threads',label:'Docling 推理线程',unit:'',help:'',min:1,max:64,group:'files',advanced:true},
 {key:'jev_concurrency',label:'JEV 请求并发',unit:'',help:'',min:1,max:64,group:'retrieval',advanced:true}]}));
 app=mount(RuntimeSettings,{target:document.body,props:{group:'files',value:{docling_timeout_secs:3600}}});
 await vi.waitFor(()=>expect(document.querySelector<HTMLInputElement>('[aria-label="Docling 转换时限"]')?.value).toBe('3600'));
 expect(document.querySelector('[aria-label="JEV 请求并发"]')).toBeNull();
 expect(document.querySelector<HTMLDetailsElement>('details')?.open).toBe(false);
 const input=document.querySelector<HTMLInputElement>('[aria-label="Docling 转换时限"]')!;
 input.value='7200';input.dispatchEvent(new Event('input',{bubbles:true}));await tick();expect(input.value).toBe('7200');
 [...document.querySelectorAll('button')].find(b=>b.textContent?.includes('恢复本组默认'))!.click();await tick();expect(input.value).toBe('1800');
});
it('reports schema loading failure without discarding saved values',async()=>{
 api.mockRejectedValue(new Error('offline'));
 app=mount(RuntimeSettings,{target:document.body,props:{group:'files',value:{docling_timeout_secs:3600}}});
 await vi.waitFor(()=>expect(document.body.textContent).toContain('offline'));
});
