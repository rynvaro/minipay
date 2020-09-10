<template>
  <!--使用class来绑定css的样式文件-->
  <div class="hello">

<span style="height: 50px;width: 200px;margin-left: 650px">
        <el-radio-group v-model="radioButton" size="medium" >
            <el-radio-button :label="true" >累计</el-radio-button>
            <el-radio-button :label="false">今日</el-radio-button>
        </el-radio-group>
    </span>
    <div v-show="radioButton">
        <div><h1>这是累计-页面！！</h1></div>
    </div>
    <div v-show="!radioButton">
        <div><h1>这是今日-页面！！</h1></div>
    </div>

    <div class="list">
      <div>diyi</div>
      <div>dier</div>
      <div>disan</div>
    </div>

    <input type="text" v-model="message" placeholder="请输入">
    <!--{{}} 输出对象属性和函数返回值-->
    <h1>{{ message }}</h1>
    <h1>site : {{site}}</h1>
    <h1>url : {{url}}</h1>
    <h3>{{details()}}</h3>

    <h1 class="hh">{{ token }}</h1>


    <button v-on:click="hello">点击</button>


  </div>


</template>

<script>
import axios from 'axios'
export default {
  name: 'apidata',
  // data用来定义返回数据的属性
  data () {
    return {
      msg: 1,
      site: "aaa",
      url: "https://aaa.github.io",
      xdata: null,
      ydata: null,
      token: 'a',
      message: '',
    }
  },
  // 用于定义js的方法
  methods: {
    details: function() {
      return this.site
    },
    hello: function(e) {
      axios.get('http://localhost:8000/v1/token?data='+this.message)
      .then(resp => (
      this.token = resp.data,
      console.log("resp is", resp.data)
      ))
    }
  },
  mounted () {
    console.log("haha")
      // response返回一个json{"data": "数据","status": "状态码","statusText":"状态文本","headers":{ "content-type": "application/json; charset=utf-8" },"config":"配置文件","method":"方法","url":"请求url","request":"请求体"}
      // axios.get('http://localhost:8000/v1/line').then(response => (this.xdata = response.data.legend_data,this.ydata = response.data.xAxis_data))
  }
}
</script>

<!--使用css的class选择器[多重样式的生效优先级]-->
<style>
.hello {
  font-size:8pt;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
h3
{
  text-align:center;
  font-size:20pt;
  color:red;
}

.list {
  background-color: red;
  font-size: 20pt;
  width: 20rem;
  height: 10em;
  display: flex;
}
.list div {
  margin-left: 20pt;
}
</style>
