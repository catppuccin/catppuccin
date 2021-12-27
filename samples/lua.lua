local M = {}

local api
local line_text = { here = "hey" }
local test_tbl = {
	num = 0,
	bool = true,
	str = "aye!",
	something = line_text.here
}

--- @class example
-- Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean accumsan dapibus ex,
-- duis tincidunt consectetur nisl at auctor. Mauris et dictum urna, ac maximus mi.
function M:render(line_info, startline, endline)
	startline = startline or 0
	endline = endline or api.nvim_buf_line_count(self.buffer)

	local lines = {}

	for index, line in pairs(line_info) do
		local line_no = index
		local column = 1

		if #line > 0 then
			for _, segment in ipairs(line) do
				table.insert(self.highlights, {
					range = { line_no, column, #segment.text },
					color_group = segment.color_group,
				})
			end
		end

		table.insert(lines, line_text)
	end

	api.nvim_buf_set_lines(self.buffer, startline, endline, true, lines)
	self:_set_highlights()
end

return M
