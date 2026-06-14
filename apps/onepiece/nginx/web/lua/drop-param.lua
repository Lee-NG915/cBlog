local drop_param = {}

local params = {
    ["quantity"] = "quantity",
    ["material"] = "material",
    ["bed_frame_size"] = "bed_frame_size",
    ["orientation"] = "orientation",
    ["length"] = "length",
    ["wood"] = "wood",
    ["leg_color"] = "leg_color",
    ["color_option"] = "color_option",
    ["size"] = "size",
    ["add_on"] = "add_on",
    ["sofa"] = "sofa",
    ["ottoman"] = "ottoman",
    ["table"] = "table",
    ["chair1"] = "chair1",
    ["chair2"] = "chair2",
    ["chair3"] = "chair3",
    ["chair"] = "chair",
    ["bench"] = "bench",
    ["armchair"] = "armchair",
    ["1"] = "1",
    ["2"] = "2",
    ["3"] = "3"
}

-----
-- Drop unneeded query parameters for domain redirect
-- @param   args  ngx.req.get_uri_args
function drop_param.process(args)
    for key, val in pairs(params) do
        args[key] = nil
    end
    return args
end

return drop_param