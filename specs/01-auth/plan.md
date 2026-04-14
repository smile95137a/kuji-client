# Plan: 01 - 認證流程

> Branch: `feat/01-auth`
> Worktree: `../kuji-client--feat-01/`
> 依賴: `fix/critical-bugs` 需先 merge（setAuth 架構）

---

## 現況評估

`AuthService.ts` 已有 6 個方法，基本完整。
主要補齊項目：

1. **Login.vue**: redirect 跳轉邏輯、錯誤訊息細化
2. **Register.vue**: client-side 驗證完善、推薦碼欄位（feat/08 協調）
3. **Google OAuth**: 確認 setAuth 呼叫、首次登入推薦碼補綁引導
4. **Composable 抽取**: Login/Register 各抽一個 composable

---

## Login.vue 修改

```
useLogin.ts composable:
  - formState: ref({ email, password })
  - isLoading, errorMessage
  - submitLogin():
      authRes = await AuthService.login(form)
      authStore.setAuth(authRes.data)
      redirect = route.query.redirect
      router.push(redirect || '/member-center/profile')
  - 錯誤處理：401 → '帳號或密碼錯誤'
               403 → '帳號已停用，請聯繫客服'
               400 → '此帳號為 Google 登入，請使用 Google 按鈕'
```

---

## Register.vue 修改

```
useRegister.ts composable:
  - formState: ref({ email, password, confirmPassword, nickname, referralCode })
  - 即時驗證: password !== confirmPassword → 顯示提示
  - referralCode debounce 500ms → referralService.validateCode()（feat/08）
  - submitRegister():
      res = await AuthService.register(form)
      authStore.setAuth(res.data)
      router.push('/member-center/profile')
```

---

## Google OAuth 補充

登入成功後，若 `user.referralCode === null`（尚未套用推薦碼），
導向 `/member-center/referral` 並帶 query `?firstLogin=true` 顯示補綁提示。

---

## 元件邊界

```
Login.vue（view，薄 shell）
  └── useLogin.ts（form state + submit）

Register.vue（view，薄 shell）
  ├── RegisterForm.vue（表單主體）
  └── useRegister.ts（form state + submit + 驗證）
```
