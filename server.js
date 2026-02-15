const express = require('express');
const path = require('path');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 擬似ユーザーデータ
const users = [
  { email: 'active@example.com', password: '123456', status: 'active' },
  { email: 'deleted@example.com', password: '123456', status: 'permanently_deleted' },
  { email: 'soft@example.com', password: '123456', status: 'soft_deleted' }
];

// ログインPOST
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    // アカウント存在しない場合は普通に失敗
    return res.status(401).send('メールアドレスかパスワードが間違っています');
  }

  // 削除済みの場合は専用ページ返す
  if (user.status === 'permanently_deleted') {
    return res.sendFile(path.join(__dirname, 'deleted-account.html'));
    // ↑ deleted-account.html は先ほど作った HTML ファイル
  }

  // 仮にソフト削除ならログイン不可・復旧案内ページに誘導も可
  if (user.status === 'soft_deleted' || user.status === 'scheduled_deletion') {
    return res.redirect('/deleted-account'); // 復旧ページなどに誘導
  }

  // 通常アカウントならパスワード検証
  if (user.password !== password) {
    return res.status(401).send('メールアドレスかパスワードが間違っています');
  }

  // ログイン成功処理
  // ここでセッション生成・JWT発行など
  res.send('ログイン成功！ようこそ');
});

// 削除済みアカウントページ（GETでも直接アクセス可）
app.get('/deleted-account', (req, res) => {
  res.sendFile(path.join(__dirname, 'deleted-account.html'));
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
