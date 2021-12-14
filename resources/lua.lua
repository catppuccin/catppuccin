local M = {}

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

	api.nvim_buf_set_lines(self.buffer, start_line, end_line, true, lines)
	self:_set_highlights()
end

local function setup_win_properties()
    local buffer_window = require("minimap.modules.logic.buffer_window")

	local win_props = {
		style = opts["win_properties"]["style"],
		relative = "win",
		win = 0,
		focusable = true,
		anchor = "NE",
		row = 0,
		height = opts["win_properties"]["height"][1],
		width = opts["win_properties"]["width"][1]
	}

    if (opts["win_properties"]["align"] == "right") then
        win_props["col"] = buffer_window.handle_relative_win_properties("col")
    elseif (opts["win_properties"]["align"] == "left") then
        win_props["col"] = 0
    end

	mmbuf_win_api.set_win_properties(win_props)
end

return M
