//_Trong main đầu tiên ta phải import express vào dự án trước

import express from 'express'
import userRouter from './routes/users.routers'
import databaseServices from './services/database.services'
import { defaultErrorHanlder } from './middlewares/errors.middlewares'
import mediaRouter from './routes/medias.routers'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routers'
import dotenv from 'dotenv'
import brandRouter from './routes/brands.routers'
import categoriesRouter from './routes/categories.routers'
import productsRouter from './routes/products.routers'
dotenv.config()

//_Tạo con PORT dành cho backend
const PORT = process.env.POST || 3000

//_Mở server lên là đồng thời cũng chạy hàm kết nối vs database luôn
//sau đó khi kết nối thì tạo các index luôn
databaseServices.connect().then(() => {
  //_Nghĩa là sau khi connect với databse thì nó sẽ chạy hàm tạo index
  //_Yên tâm là khi nó có tạo key rồi thì nó sẽ không tạo lại nữa. Còn nếu chưa có thì sẽ tạo
  databaseServices.indexUsers()
  databaseServices.indexRefreshToken()
})

//_Chạy server thì tạo các folder này
initFolder()

//_Dựng server
const app = express()

//_Tạo một middleware xài chung cho tất cả. Nghĩa là chỉ cần /3000 thì biến tất cả thành json khi gửi lên
// use nghĩa là sử dụng một middleware và nó có nhiệm vụ biến mọi thứ thành json, mà app.use nghĩa là toàn cục, cứ bc vào localhost 3000 thì biến đi
app.use(express.json())

//_Sử dụng userRouter
app.use('/users', userRouter)

//_Sử dụng mediaRouter
app.use('/medias', mediaRouter)

app.use('/static', staticRouter) //serving: chia sẻ

app.use('/brands', brandRouter)

app.use('/categories', categoriesRouter)

app.use('/products', productsRouter)

//_hàm này sẽ chạy cuối cùng và sẽ giúp bắt tất cả các lỗi
app.use(defaultErrorHanlder)

//_Lắng nghe PORT mở và cho server chạy trên PORT 3000, listen xem có ai đứng ở đó chưa. Nếu chưa có thì mở
app.listen(PORT, () => {
  console.log('Server BE được chạy với PORT: ' + PORT)
})
