import type { VendorRecord } from "./property-types";
export const demoVendors: VendorRecord[] = [{ id:"vendor-hvac", organizationId:"demo", name:"Approved HVAC Vendor", category:"contractor", activeProjects:[], approvalRequired:true }, { id:"vendor-move", organizationId:"demo", name:"Move Planning Vendor", category:"vendor", activeProjects:["proj-relocation"], approvalRequired:true }];
export const vendorConcentration = (vendors:VendorRecord[]) => vendors.filter(v=>v.activeProjects.length>1);
