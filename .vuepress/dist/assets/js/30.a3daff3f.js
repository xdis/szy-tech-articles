(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{205:function(s,t,n){"use strict";n.r(t);var a=n(0),e=Object(a.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"content"},[n("h1",{attrs:{id:"windows开发环境简单安装部署"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#windows开发环境简单安装部署","aria-hidden":"true"}},[s._v("#")]),s._v(" Windows开发环境简单安装部署")]),n("blockquote",[n("p",[s._v("2017.7-目前手头有一台"),n("code",[s._v("Dell Vostro V131")]),s._v("，虽然已经不用Windows且配置略老但偶尔还是要用的，没心思整黑苹果了，直接装Win10-LSTB + bash + cmder环境试试。")])]),n("ul",[n("li",[n("p",[s._v("先从msdnitellyou下载系统镜像"),n("code",[s._v("Windows 10 Enterprise 2016 LTSB (x64) - DVD")])])]),n("li",[n("p",[s._v("安装完毕，又是很怀念的windows log~")])])]),n("p",[n("img",{attrs:{src:"http://static.zybuluo.com/szy0syz/zul0h8envd7e14vl6j5dboss/screen.jpg",alt:"screen.jpg-106.4kB"}})]),n("ul",[n("li",[n("p",[n("code",[s._v("win + i")]),s._v("启用 [设置] - [更新和安全] - [针对开发者人员]")])]),n("li",[n("p",[s._v("[x] [开发者模式]")])]),n("li",[n("p",[s._v("[控制面板] - [程序] - [删除程序] - [启用或关闭windows功能]")])]),n("li",[n("p",[s._v("[x] "),n("code",[s._v("适用于Linux的windows子系统")])])]),n("li",[n("p",[s._v("启动"),n("code",[s._v("bash.exe")]),s._v("安装")])]),n("li",[n("p",[s._v("安装cmder，修改[Settings] - [Startup] - [Command line] = "),n("code",[s._v("%windir%\\system32\\bash.exe ~ -cur_console:p:n")])])]),n("li",[n("p",[s._v("更新Ubuntu系统")])])]),n("div",{staticClass:"language-bash extra-class"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),n("span",{attrs:{class:"token function"}},[s._v("apt-get")]),s._v(" update\n"),n("span",{attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),n("span",{attrs:{class:"token function"}},[s._v("apt-get")]),s._v(" "),n("span",{attrs:{class:"token function"}},[s._v("install")]),s._v(" build-essential libssl-dev  \n")])])]),n("ul",[n("li",[s._v("安装&更新")])]),n("div",{staticClass:"language-bash extra-class"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{attrs:{class:"token function"}},[s._v("apt-get")]),s._v(" "),n("span",{attrs:{class:"token function"}},[s._v("install")]),s._v(" "),n("span",{attrs:{class:"token function"}},[s._v("git")]),s._v("\n\n"),n("span",{attrs:{class:"token function"}},[s._v("curl")]),s._v(" -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh "),n("span",{attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),n("span",{attrs:{class:"token function"}},[s._v("bash")]),s._v("  \n"),n("span",{attrs:{class:"token function"}},[s._v("wget")]),s._v(" -qO- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh "),n("span",{attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),n("span",{attrs:{class:"token function"}},[s._v("bash")]),s._v("  \n\n")])])]),n("ul",[n("li",[n("p",[s._v("更新ConEmu终端模拟器https://www.fosshub.com/ConEmu.html")])])])])}],!1,null,null,null);t.default=e.exports}}]);