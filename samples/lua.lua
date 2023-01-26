---@class Emmy
local var = {} -- a short comment
local a, b, c = true, false, nil
--region my class members region

---@alias MyType Emmy

--- doc comment
---@param par1 Par1Type @comments
function var:fun(par1, par2)
  print('hello')
  return self.len + 2
end

---@overload fun(name:string):Emmy
function var.staticFun()
end
--endregion end my class members region

---@return Emmy
function findEmmy()
  return "string" .. var
end

globalVar = {
  property = value
}
