// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import FrontLayout from '@/layouts/FrontLayout.vue';
import Home from '@/views/Home.vue';
import Ranking from '@/views/Ranking.vue';
import News from '@/views/News.vue';
import NewsDetail from '@/views/NewsDetail.vue';
import NotFound from '@/views/NotFound.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import ForgotPassword from '@/views/ForgotPassword.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import Policy from '@/views/Policy.vue';
import Privacy from '@/views/Privacy.vue';
import IchibanList from '@/views/IchibanList.vue';
import IchibanDetail from '@/views/IchibanDetail.vue';
import About from '@/views/About.vue';
import Faq from '@/views/Faq.vue';
import Promotion from '@/views/Promotion.vue';
import Transaction from '@/views/Transaction.vue';
import Cooperation from '@/views/Cooperation.vue';
import Terms from '@/views/Terms.vue';
import MemberCenter from '@/views/member/MemberCenter.vue';

import MemberProfile from '@/views/member/MemberProfile.vue';
import Deposit from '@/views/member/Deposit.vue';
import DepositHistory from '@/views/member/DepositHistory.vue';
import TransactionHistory from '@/views/member/TransactionHistory.vue';
import Notifications from '@/views/member/Notifications.vue';
import ProfileEdit from '@/views/member/ProfileEdit.vue';
import PrizeBox from '@/views/member/PrizeBox.vue';
import AddressBook from '@/views/member/AddressBook.vue';
import OrderList from '@/views/member/OrderList.vue';

// 新增專區頁面
import GachaList from '@/views/GachaList.vue';
import ScratchCardList from '@/views/ScratchCardList.vue';
import StoreLotteries from '@/views/StoreLotteries.vue';

// Dialog 測試頁面
import DialogTestPage from '@/views/DialogTestPage.vue';

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: FrontLayout,
    meta: { layout: 'default' },
    children: [
      { path: '', redirect: '/home' },
      {
        component: About,
        path: 'about',
        name: 'About',
      },
      {
        component: Faq,
        path: 'faq',
        name: 'Faq',
      },
      {
        component: Promotion,
        path: 'promotion',
        name: 'Promotion',
      },
      {
        component: Transaction,
        path: 'transaction',
        name: 'Transaction',
      },
      {
        component: Cooperation,
        path: 'cooperation',
        name: 'Cooperation',
      },
      {
        component: Terms,
        path: 'terms',
        name: 'Terms',
      },

      {
        component: Login,
        path: 'login',
        name: 'Login',
      },
      {
        component: Register,
        path: 'register',
        name: 'Register',
      },
      {
        component: ForgotPassword,
        path: 'forgot-password',
        name: 'ForgotPassword',
      },
      {
        component: ResetPassword,
        path: 'reset-password',
        name: 'ResetPassword',
      },
      {
        component: Policy,
        path: 'policy',
        name: 'Policy',
      },
      {
        component: Privacy,
        path: 'privacy',
        name: 'Privacy',
      },

      // ✅ Dialog 測試頁面（開發用）
      {
        component: DialogTestPage,
        path: 'dialog-test',
        name: 'DialogTestPage',
      },

      {
        path: 'home',
        name: 'Home',
        component: Home,
      },

      {
        path: 'ranking',
        name: 'Ranking',
        component: Ranking,
      },

      {
        path: 'news',
        name: 'News',
        component: News,
      },

      {
        path: 'news/:id',
        name: 'NewsDetail',
        component: NewsDetail,
      },

      {
        path: 'ichiban',
        name: 'IchibanList',
        component: IchibanList,
      },

      {
        path: 'ichiban/:id',
        name: 'IchibanDetail',
        component: IchibanDetail,
      },

      // 店家商品頁
      {
        path: 'store/:storeId',
        name: 'StoreLotteries',
        component: StoreLotteries,
      },

      // 扭蛋專區
      {
        path: 'gacha',
        name: 'GachaList',
        component: GachaList,
      },

      // 刮刮樂專區
      {
        path: 'scratch',
        name: 'ScratchCardList',
        component: ScratchCardList,
      },

      {
        path: 'member-center',
        name: 'MemberCenter',
        component: MemberCenter,
        meta: { requiresAuth: true },
        redirect: { name: 'MemberProfile' },
        children: [
          {
            path: 'profile',
            name: 'MemberProfile',
            component: MemberProfile,
            meta: { requiresAuth: true },
          },
          {
            path: 'profile/edit',
            name: 'ProfileEdit',
            component: ProfileEdit,
            meta: { requiresAuth: true },
          },
          {
            path: 'deposit',
            name: 'Deposit',
            component: Deposit,
            meta: { requiresAuth: true },
          },
          {
            path: 'deposit-history',
            name: 'DepositHistory',
            component: DepositHistory,
            meta: { requiresAuth: true },
          },
          {
            path: 'transaction-history',
            name: 'TransactionHistory',
            component: TransactionHistory,
            meta: { requiresAuth: true },
          },
          {
            path: 'prize-box',
            name: 'PrizeBox',
            component: PrizeBox,
            meta: { requiresAuth: true },
          },
          {
            path: 'address-book',
            name: 'AddressBook',
            component: AddressBook,
            meta: { requiresAuth: true },
          },
          {
            path: 'orders',
            name: 'OrderList',
            component: OrderList,
            meta: { requiresAuth: true },
          },
          {
            path: 'notifications',
            name: 'MemberNotifications',
            component: Notifications,
            meta: { requiresAuth: true },
          },
        ],
      },

      {
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory('/kuji/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

export default router;
