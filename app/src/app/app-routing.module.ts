import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { Shell } from '@shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'wallet',
      loadChildren: 'pages/wallet/wallet.module#WalletModule'
    },
    {
      path: 'api-keys',
      loadChildren: 'pages/api-keys/api-keys.module#ApiKeysModule'
    },
    {
      path: 'contracts',
      loadChildren: 'pages/contracts/contracts.module#ContractsModule'
    }
  ]),
  // Fallback when no prior route is matched
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      useHash: true
    })
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
